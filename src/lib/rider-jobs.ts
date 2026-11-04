import type { Prisma, Rider } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { DELIVERY_CONFIG, type DeliveryFailReasonValue } from "@/lib/delivery-config"
import { generateSixDigitOtp, hashDeliveryOtp, isValidOtpFormat, otpExpiresAt, verifyDeliveryOtp } from "@/lib/delivery-otp"
import { resend } from "@/lib/resend"
import { DeliveryOtpEmail } from "@/emails/DeliveryOtpEmail"
import { DeliveryFailedEmail } from "@/emails/DeliveryFailedEmail"

/**
 * Rider job mutations shared by the website rider dashboard (server actions) and the mobile app (API routes).
 * Callers must authenticate the rider first and pass the active rider record.
 */

export function failReasonLabel(reason: string) {
  return DELIVERY_CONFIG.failReasons.find((r) => r.value === reason)?.label || reason
}

export async function audit(
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

export async function setRiderOnline(rider: Rider, online: boolean) {
  if (!online) {
    const active = await db.deliveryJob.count({
      where: { riderId: rider.id, status: { in: ["ASSIGNED", "PICKED_UP"] } },
    })
    if (active > 0) {
      return { error: "Finish or fail your active delivery before going offline." }
    }
  }

  await db.rider.update({
    where: { id: rider.id },
    data: {
      isOnline: online,
      ...(online ? { lastOnlineAt: new Date() } : {}),
    },
  })

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  return { success: true as const, isOnline: online }
}

/** First online rider to accept wins — concurrency-safe with row lock. */
export async function acceptDeliveryJob(rider: Rider, jobId: string) {
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
      // Ready once payment is confirmed. If a store marked SHIPPED/DELIVERED early,
      // still allow accept and pull the order back to PROCESSING for the rider flow.
      if (!["PROCESSING", "SHIPPED", "DELIVERED"].includes(job.order.status)) {
        throw new Error("NOT_READY")
      }
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

      if (job.order.status !== "PROCESSING") {
        await tx.order.update({
          where: { id: job.orderId },
          data: { status: "PROCESSING" },
        })
      }

      await audit(tx, {
        deliveryJobId: jobId,
        riderId: rider.id,
        actorType: "RIDER",
        actorId: rider.id,
        action: "ACCEPTED",
      })

      return job.order.orderNumber
    })

    const { notifyDeliveryAccepted } = await import("@/lib/delivery-notifications")
    await notifyDeliveryAccepted(jobId)

    revalidatePath("/rider")
    revalidatePath("/super-admin/deliveries")
    return { success: true as const, orderNumber }
  } catch (err) {
    const code = err instanceof Error ? err.message : ""
    if (code === "TAKEN") return { error: "Another rider already accepted this delivery." }
    if (code === "BUSY") return { error: "You already have an active delivery. Finish it first." }
    if (code === "OFFLINE") return { error: "Go online before accepting deliveries." }
    if (code === "NOT_READY") return { error: "This order is not ready for pickup yet." }
    if (code === "CLOSED" || code === "NOT_FOUND") return { error: "This delivery is no longer available." }
    console.error("acceptDeliveryJob", err)
    return { error: "Could not accept this delivery. Try again." }
  }
}

export async function markJobPickedUp(rider: Rider, jobId: string) {
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
  if (!job || job.riderId !== rider.id) return { error: "This job is not yours." }
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
      riderId: rider.id,
      actorType: "RIDER",
      actorId: rider.id,
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

  const { notifyDeliveryPickedUp } = await import("@/lib/delivery-notifications")
  await notifyDeliveryPickedUp(jobId)

  revalidatePath("/rider")
  revalidatePath("/super-admin/deliveries")
  if (job.order.trackingToken) revalidatePath(`/track/${job.order.trackingToken}`)
  return { success: true as const }
}

export async function markJobDelivered(rider: Rider, jobId: string, otpInput: string) {
  const otp = String(otpInput || "").trim()
  if (!isValidOtpFormat(otp)) return { error: "Enter the 6-digit code from the customer." }

  try {
    await db.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "DeliveryJob"
        WHERE id = ${jobId}
          AND "riderId" = ${rider.id}
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
          riderId: rider.id,
          actorType: "RIDER",
          actorId: rider.id,
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
          riderId: rider.id,
          deliveryJobId: jobId,
          type: "DELIVERY_CUT",
          amount: job.shoporaCut,
          note: `Cut from ${job.order.orderNumber}`,
        },
      })
      await tx.rider.update({
        where: { id: rider.id },
        data: { walletOwed: { increment: job.shoporaCut } },
      })
      await audit(tx, {
        deliveryJobId: jobId,
        riderId: rider.id,
        actorType: "RIDER",
        actorId: rider.id,
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
    console.error("markJobDelivered", err)
    return { error: "Could not complete delivery." }
  }

  const { notifyDeliveryCompleted } = await import("@/lib/delivery-notifications")
  await notifyDeliveryCompleted(jobId)

  revalidatePath("/rider")
  revalidatePath("/rider/earnings")
  revalidatePath("/rider/history")
  revalidatePath("/super-admin/deliveries")
  return { success: true as const }
}

export async function reportFailedDelivery(
  rider: Rider,
  input: { jobId: string; reason: string; notes?: string | null }
) {
  const jobId = input.jobId
  const reason = input.reason as DeliveryFailReasonValue
  const notes = input.notes?.trim() || null

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
  if (!job || job.riderId !== rider.id) return { error: "This job is not yours." }
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
      riderId: rider.id,
      actorType: "RIDER",
      actorId: rider.id,
      action: "FAILED",
      note: `${reason}${notes ? `: ${notes}` : ""}`,
    })
  })

  const note = `${failReasonLabel(reason)}${notes ? ` — ${notes}` : ""}`
  const { notifyDeliveryFailed } = await import("@/lib/delivery-notifications")
  await notifyDeliveryFailed(jobId, note)

  try {
    await resend.emails.send({
      from: "Shopora Delivery <orders@shopora.space>",
      to: "shoporaspace@gmail.com",
      subject: `Delivery failed · ${job.order.orderNumber}`,
      react: DeliveryFailedEmail({
        recipientName: "Shopora",
        storeName: job.order.store.name,
        orderNumber: job.order.orderNumber,
        reason: failReasonLabel(reason),
        notes,
        riderName: rider.name,
        dropoffAddress: job.dropoffAddress,
      }),
    })
  } catch (err) {
    console.error("Failed delivery admin notify:", err)
  }

  revalidatePath("/rider")
  revalidatePath("/rider/history")
  revalidatePath("/super-admin/deliveries")
  if (job.order.trackingToken) revalidatePath(`/track/${job.order.trackingToken}`)
  return { success: true as const }
}
