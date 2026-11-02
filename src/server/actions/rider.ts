"use server"

import { hash, compare } from "bcryptjs"
import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { clearRiderSession, requireRider, setRiderSession } from "@/lib/rider-session"
import { DELIVERY_CONFIG, type DeliveryFailReasonValue } from "@/lib/delivery-config"
import { generateSixDigitOtp, hashDeliveryOtp, isValidOtpFormat, otpExpiresAt, verifyDeliveryOtp } from "@/lib/delivery-otp"
import { resend } from "@/lib/resend"
import { DeliveryOtpEmail } from "@/emails/DeliveryOtpEmail"
import { DeliveryFailedEmail } from "@/emails/DeliveryFailedEmail"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim()
}

function failReasonLabel(reason: string) {
  return DELIVERY_CONFIG.failReasons.find((r) => r.value === reason)?.label || reason
}

async function audit(
  tx: Prisma.TransactionClient,
  data: {
    deliveryJobId: string
    riderId?: string | null
    actorType: string
    actorId?: string | null
    action: "ACCEPTED" | "PICKED_UP" | "DELIVERED" | "FAILED" | "REOPENED" | "CANCELLED" | "ASSIGNED_MANUAL" | "OTP_FAILED"
    note?: string
  }
) {
  await tx.deliveryAuditLog.create({
    data: {
      deliveryJobId: data.deliveryJobId,
      riderId: data.riderId ?? null,
      actorType: data.actorType,
      actorId: data.actorId ?? null,
      action: data.action,
      note: data.note,
    },
  })
}

export async function riderLoginAction(formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") || ""))
  const password = String(formData.get("password") || "")
  if (!phone || !password) return { error: "Enter your phone number and password." }

  const rider = await db.rider.findUnique({ where: { phone } })
  if (!rider || !(await compare(password, rider.passwordHash))) {
    return { error: "Wrong phone number or password." }
  }
  if (rider.status !== "ACTIVE") {
    return { error: "Your rider account is not active yet. Contact Shopora." }
  }

  await setRiderSession(rider.id)
  redirect("/rider")
}

export async function riderLogoutAction() {
  await clearRiderSession()
  redirect("/rider/login")
}

export async function setRiderOnlineAction(online: boolean) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }

  if (!online) {
    const active = await db.deliveryJob.count({
      where: { riderId: auth.rider.id, status: { in: ["ASSIGNED", "PICKED_UP"] } },
    })
    if (active > 0) {
      return { error: "Finish or fail your active delivery before going offline." }
    }
  }

  await db.rider.update({
    where: { id: auth.rider.id },
    data: {
      isOnline: online,
      ...(online ? { lastOnlineAt: new Date() } : {}),
    },
  })

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  return { success: true, isOnline: online }
}

/** First online rider to accept wins — concurrency-safe with row lock. */
export async function acceptDeliveryJobAction(jobId: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }
  const { rider } = auth

  if (!rider.isOnline) {
    return { error: "Go online before accepting deliveries." }
  }

  try {
    const orderNumber = await db.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "DeliveryJob"
        WHERE id = ${jobId}
          AND status = 'PENDING'::"DeliveryJobStatus"
          AND "riderId" IS NULL
        FOR UPDATE
      `
      if (locked.length === 0) {
        throw new Error("TAKEN")
      }

      const job = await tx.deliveryJob.findUnique({
        where: { id: jobId },
        include: { order: { select: { status: true, deliveryMethod: true, orderNumber: true } } },
      })
      if (!job || job.order.deliveryMethod !== "SHOPORA") throw new Error("NOT_FOUND")
      if (job.order.status !== "PROCESSING") throw new Error("NOT_READY")
      if (["CANCELLED", "DELIVERED", "FAILED"].includes(job.status)) throw new Error("CLOSED")

      if (DELIVERY_CONFIG.oneActiveJobAtATime) {
        const busy = await tx.deliveryJob.count({
          where: { riderId: rider.id, status: { in: ["ASSIGNED", "PICKED_UP"] } },
        })
        if (busy > 0) throw new Error("BUSY")
      }

      const liveRider = await tx.rider.findUnique({ where: { id: rider.id } })
      if (!liveRider || liveRider.status !== "ACTIVE" || !liveRider.isOnline) throw new Error("OFFLINE")

      await tx.deliveryJob.update({
        where: { id: jobId },
        data: {
          riderId: rider.id,
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      })

      await audit(tx, {
        deliveryJobId: jobId,
        riderId: rider.id,
        actorType: "RIDER",
        actorId: rider.id,
        action: "ACCEPTED",
      })

      return job.order.orderNumber
    })

    revalidatePath("/rider")
    revalidatePath("/super-admin/deliveries")
    return { success: true, orderNumber }
  } catch (err) {
    const code = err instanceof Error ? err.message : ""
    if (code === "TAKEN") return { error: "Another rider already accepted this delivery." }
    if (code === "BUSY") return { error: "You already have an active delivery. Finish it first." }
    if (code === "OFFLINE") return { error: "Go online before accepting deliveries." }
    if (code === "NOT_READY") return { error: "This order is not ready for pickup yet." }
    if (code === "CLOSED" || code === "NOT_FOUND") return { error: "This delivery is no longer available." }
    console.error("acceptDeliveryJobAction", err)
    return { error: "Could not accept this delivery. Try again." }
  }
}

export async function markJobPickedUpAction(jobId: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }

  const job = await db.deliveryJob.findUnique({
    where: { id: jobId },
    include: {
      order: {
        include: {
          customer: true,
          store: { select: { name: true, contactEmail: true, members: { include: { user: { select: { email: true } } } } } },
        },
      },
    },
  })
  if (!job || job.riderId !== auth.rider.id) return { error: "This job is not yours." }
  if (job.status !== "ASSIGNED") return { error: "Pick up is only available after you accept the job." }

  const otp = generateSixDigitOtp()
  const otpHash = await hashDeliveryOtp(otp)
  const expires = otpExpiresAt()

  await db.$transaction(async (tx) => {
    await tx.deliveryJob.update({
      where: { id: jobId },
      data: {
        status: "PICKED_UP",
        pickedUpAt: new Date(),
        deliveryOtpHash: otpHash,
        deliveryOtpCode: otp,
        deliveryOtpExpiresAt: expires,
        deliveryOtpAttempts: 0,
      },
    })
    await tx.order.update({
      where: { id: job.orderId },
      data: { status: "SHIPPED" },
    })
    await audit(tx, {
      deliveryJobId: jobId,
      riderId: auth.rider.id,
      actorType: "RIDER",
      actorId: auth.rider.id,
      action: "PICKED_UP",
    })
  })

  const trackingUrl = job.order.trackingToken
    ? `https://www.shopora.space/track/${job.order.trackingToken}`
    : "https://www.shopora.space"
  const customerEmail = job.order.customer.email
  if (customerEmail) {
    try {
      await resend.emails.send({
        from: `${job.order.store.name.replace(/[<>"\\,;:@]/g, "").trim() || "Shopora"} <orders@shopora.space>`,
        to: customerEmail,
        subject: `Your delivery code for ${job.order.orderNumber}`,
        react: DeliveryOtpEmail({
          customerFirstName: job.order.customer.name.trim().split(/\s+/)[0] || "there",
          storeName: job.order.store.name,
          orderNumber: job.order.orderNumber,
          otp,
          trackingUrl,
        }),
      })
    } catch (err) {
      console.error("Failed to email delivery OTP:", err)
    }
  }

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  if (job.order.trackingToken) revalidatePath(`/track/${job.order.trackingToken}`)
  return { success: true }
}

export async function markJobDeliveredAction(jobId: string, otpInput: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }

  const otp = String(otpInput || "").trim()
  if (!isValidOtpFormat(otp)) return { error: "Enter the 6-digit code from the customer." }

  try {
    await db.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "DeliveryJob"
        WHERE id = ${jobId}
          AND "riderId" = ${auth.rider.id}
          AND status = 'PICKED_UP'::"DeliveryJobStatus"
        FOR UPDATE
      `
      if (locked.length === 0) throw new Error("NOT_YOURS")

      const job = await tx.deliveryJob.findUnique({
        where: { id: jobId },
        include: { order: true },
      })
      if (!job || !job.deliveryOtpHash) throw new Error("NO_OTP")
      if (job.deliveryOtpExpiresAt && job.deliveryOtpExpiresAt < new Date()) throw new Error("EXPIRED")
      if (job.deliveryOtpAttempts >= DELIVERY_CONFIG.otpMaxAttempts) throw new Error("LOCKED")

      const ok = await verifyDeliveryOtp(otp, job.deliveryOtpHash)
      if (!ok) {
        await tx.deliveryJob.update({
          where: { id: jobId },
          data: { deliveryOtpAttempts: { increment: 1 } },
        })
        await audit(tx, {
          deliveryJobId: jobId,
          riderId: auth.rider.id,
          actorType: "RIDER",
          actorId: auth.rider.id,
          action: "OTP_FAILED",
          note: `Attempt ${job.deliveryOtpAttempts + 1}`,
        })
        throw new Error("BAD_OTP")
      }

      await tx.deliveryJob.update({
        where: { id: jobId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          deliveryOtpCode: null,
          deliveryOtpHash: null,
        },
      })
      await tx.order.update({
        where: { id: job.orderId },
        data: { status: "DELIVERED" },
      })
      await tx.riderWalletEntry.create({
        data: {
          riderId: auth.rider.id,
          deliveryJobId: jobId,
          type: "DELIVERY_CUT",
          amount: job.shoporaCut,
          note: `Cut from ${job.order.orderNumber}`,
        },
      })
      await tx.rider.update({
        where: { id: auth.rider.id },
        data: { walletOwed: { increment: job.shoporaCut } },
      })
      await audit(tx, {
        deliveryJobId: jobId,
        riderId: auth.rider.id,
        actorType: "RIDER",
        actorId: auth.rider.id,
        action: "DELIVERED",
      })
    })
  } catch (err) {
    const code = err instanceof Error ? err.message : ""
    if (code === "BAD_OTP") return { error: "Wrong delivery code. Ask the customer for the code from their email or tracking page." }
    if (code === "EXPIRED") return { error: "This delivery code has expired. Ask Shopora admin to reopen the job." }
    if (code === "LOCKED") return { error: "Too many wrong attempts. Contact Shopora admin." }
    if (code === "NO_OTP") return { error: "No delivery code on this job. Mark picked up first." }
    if (code === "NOT_YOURS") return { error: "This job is not ready to complete." }
    console.error("markJobDeliveredAction", err)
    return { error: "Could not complete delivery." }
  }

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  return { success: true }
}

export async function reportFailedDeliveryAction(formData: FormData) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }

  const jobId = String(formData.get("jobId") || "")
  const reason = String(formData.get("reason") || "") as DeliveryFailReasonValue
  const notes = String(formData.get("notes") || "").trim() || null

  if (!jobId || !DELIVERY_CONFIG.failReasons.some((r) => r.value === reason)) {
    return { error: "Choose a failure reason." }
  }

  const job = await db.deliveryJob.findUnique({
    where: { id: jobId },
    include: {
      order: {
        include: {
          customer: true,
          store: {
            select: {
              name: true,
              contactEmail: true,
              members: { include: { user: { select: { email: true } } } },
            },
          },
        },
      },
    },
  })
  if (!job || job.riderId !== auth.rider.id) return { error: "This job is not yours." }
  if (job.status !== "ASSIGNED" && job.status !== "PICKED_UP") {
    return { error: "Only active deliveries can be marked failed." }
  }

  await db.$transaction(async (tx) => {
    await tx.deliveryJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        failedReason: reason,
        failedNotes: notes,
        failedAt: new Date(),
        deliveryOtpCode: null,
        deliveryOtpHash: null,
      },
    })
    await audit(tx, {
      deliveryJobId: jobId,
      riderId: auth.rider.id,
      actorType: "RIDER",
      actorId: auth.rider.id,
      action: "FAILED",
      note: `${reason}${notes ? `: ${notes}` : ""}`,
    })
  })

  const vendorEmails = [
    job.order.store.contactEmail,
    ...job.order.store.members.map((m) => m.user?.email),
  ].filter((e): e is string => !!e)
  const recipients = [...new Set([...vendorEmails, "shoporaspace@gmail.com"])]

  try {
    await Promise.all(
      recipients.map((to) =>
        resend.emails.send({
          from: "Shopora Delivery <orders@shopora.space>",
          to,
          subject: `Delivery failed · ${job.order.orderNumber}`,
          react: DeliveryFailedEmail({
            recipientName: to === "shoporaspace@gmail.com" ? "Shopora" : "there",
            storeName: job.order.store.name,
            orderNumber: job.order.orderNumber,
            reason: failReasonLabel(reason),
            notes,
            riderName: auth.rider.name,
            dropoffAddress: job.dropoffAddress,
          }),
        })
      )
    )
  } catch (err) {
    console.error("Failed delivery notify:", err)
  }

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  if (job.order.trackingToken) revalidatePath(`/track/${job.order.trackingToken}`)
  return { success: true }
}

export async function createRiderAction(formData: FormData) {
  const { getServerSession } = await import("next-auth/next")
  const { authOptions } = await import("@/auth")
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }

  const admin = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } })
  if (admin?.platformRole !== "SUPER_ADMIN") return { error: "Unauthorized" }

  const name = String(formData.get("name") || "").trim()
  const phone = normalizePhone(String(formData.get("phone") || ""))
  const email = String(formData.get("email") || "").trim().toLowerCase() || null
  const password = String(formData.get("password") || "")
  const momoNumber = String(formData.get("momoNumber") || "").trim() || null
  const type = String(formData.get("type") || "MANAGED") === "INDEPENDENT" ? "INDEPENDENT" : "MANAGED"

  if (!name || !phone || password.length < 6) {
    return { error: "Name, phone, and a password (6+ characters) are required." }
  }
  if (!email || !email.includes("@")) {
    return { error: "Email is required so riders get new-job alerts." }
  }

  const existing = await db.rider.findUnique({ where: { phone } })
  if (existing) return { error: "A rider with this phone number already exists." }

  await db.rider.create({
    data: {
      name,
      phone,
      email,
      momoNumber,
      type,
      status: "ACTIVE",
      isOnline: false,
      city: "Accra",
      passwordHash: await hash(password, 10),
    },
  })

  revalidatePath("/super-admin/riders")
  return { success: true }
}

export async function setRiderStatusAction(riderId: string, status: "ACTIVE" | "SUSPENDED" | "PENDING") {
  const { getServerSession } = await import("next-auth/next")
  const { authOptions } = await import("@/auth")
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  const admin = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } })
  if (admin?.platformRole !== "SUPER_ADMIN") return { error: "Unauthorized" }

  await db.rider.update({
    where: { id: riderId },
    data: {
      status,
      ...(status !== "ACTIVE" ? { isOnline: false } : {}),
    },
  })
  revalidatePath("/super-admin/riders")
  revalidatePath("/super-admin/deliveries")
  return { success: true }
}

async function requireSuperAdmin() {
  const { getServerSession } = await import("next-auth/next")
  const { authOptions } = await import("@/auth")
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" as const }
  const admin = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } })
  if (admin?.platformRole !== "SUPER_ADMIN") return { error: "Unauthorized" as const }
  return { ok: true as const, userId: session.user.id }
}

export async function settleRiderWalletAction(formData: FormData) {
  const auth = await requireSuperAdmin()
  if ("error" in auth) return { error: auth.error }

  const riderId = String(formData.get("riderId") || "")
  const amount = Number(formData.get("amount"))
  const note = String(formData.get("note") || "").trim() || "MoMo settlement"

  if (!riderId || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid settlement amount." }
  }

  const rider = await db.rider.findUnique({ where: { id: riderId } })
  if (!rider) return { error: "Rider not found." }
  if (amount > rider.walletOwed + 0.001) {
    return { error: `They only owe GHS ${rider.walletOwed.toFixed(2)} right now.` }
  }

  await db.$transaction([
    db.riderWalletEntry.create({
      data: {
        riderId,
        type: "SETTLEMENT",
        amount: -amount,
        note,
      },
    }),
    db.rider.update({
      where: { id: riderId },
      data: { walletOwed: { decrement: amount } },
    }),
  ])

  revalidatePath("/super-admin/riders")
  revalidatePath("/super-admin/deliveries")
  return { success: true }
}

/** Admin: clear assignment and put job back on the open board. */
export async function reopenDeliveryJobAction(jobId: string) {
  const auth = await requireSuperAdmin()
  if ("error" in auth) return { error: auth.error }

  const job = await db.deliveryJob.findUnique({
    where: { id: jobId },
    include: { order: true },
  })
  if (!job) return { error: "Job not found." }
  if (job.status === "DELIVERED") return { error: "Completed deliveries cannot be reopened." }
  if (job.status === "PENDING" && !job.riderId) return { error: "This job is already open." }

  await db.$transaction(async (tx) => {
    await tx.deliveryJob.update({
      where: { id: jobId },
      data: {
        previousRiderId: job.riderId,
        riderId: null,
        status: "PENDING",
        assignedAt: null,
        pickedUpAt: null,
        failedReason: null,
        failedNotes: null,
        failedAt: null,
        deliveryOtpHash: null,
        deliveryOtpCode: null,
        deliveryOtpExpiresAt: null,
        deliveryOtpAttempts: 0,
      },
    })
    if (job.order.status === "SHIPPED") {
      await tx.order.update({
        where: { id: job.orderId },
        data: { status: "PROCESSING" },
      })
    }
    await audit(tx, {
      deliveryJobId: jobId,
      riderId: job.riderId,
      actorType: "ADMIN",
      actorId: auth.userId,
      action: "REOPENED",
      note: "Admin reopened for new rider accept",
    })
  })

  try {
    const { notifyRidersOfOpenJob } = await import("@/lib/notify-riders")
    await notifyRidersOfOpenJob(job.orderId)
  } catch (err) {
    console.error("Reopen notify riders:", err)
  }

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  if (job.order.trackingToken) revalidatePath(`/track/${job.order.trackingToken}`)
  return { success: true }
}

export async function cancelDeliveryJobAction(jobId: string, note?: string) {
  const auth = await requireSuperAdmin()
  if ("error" in auth) return { error: auth.error }

  const job = await db.deliveryJob.findUnique({ where: { id: jobId }, include: { order: true } })
  if (!job) return { error: "Job not found." }
  if (job.status === "DELIVERED") return { error: "Cannot cancel a completed delivery." }

  await db.$transaction(async (tx) => {
    await tx.deliveryJob.update({
      where: { id: jobId },
      data: {
        status: "CANCELLED",
        deliveryOtpCode: null,
        deliveryOtpHash: null,
      },
    })
    await audit(tx, {
      deliveryJobId: jobId,
      riderId: job.riderId,
      actorType: "ADMIN",
      actorId: auth.userId,
      action: "CANCELLED",
      note: note || "Cancelled by admin",
    })
  })

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  return { success: true }
}
