"use server"

import { hash, compare } from "bcryptjs"
import { db } from "@/lib/db"
import { clearRiderSession, requireRider, setRiderSession } from "@/lib/rider-session"
import { resend } from "@/lib/resend"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { normalizeRiderPhone, riderPhoneLookupVariants } from "@/lib/rider-phone"
import {
  acceptDeliveryJob,
  audit,
  markJobDelivered,
  markJobPickedUp,
  reportFailedDelivery,
  setRiderOnline,
} from "@/lib/rider-jobs"

function normalizePhone(phone: string) {
  return normalizeRiderPhone(phone)
}

export async function riderLoginAction(formData: FormData) {
  const phoneInput = String(formData.get("phone") || "")
  const password = String(formData.get("password") || "")
  const variants = riderPhoneLookupVariants(phoneInput)
  if (!variants.length || !password) return { error: "Enter your phone number and password." }

  const riders = await db.rider.findMany({ where: { phone: { in: variants } }, take: 5 })
  let rider = riders[0] ?? null
  if (riders.length > 1) {
    // Prefer exact normalized match when duplicates somehow exist
    const preferred = normalizePhone(phoneInput)
    rider = riders.find((r) => r.phone === preferred) || riders[0]
  }

  if (!rider || !(await compare(password, rider.passwordHash))) {
    return { error: "Wrong phone number or password. Try 0XXXXXXXXX or +233XXXXXXXXX." }
  }
  if (rider.status === "PENDING") {
    return { error: "Your account is waiting for Shopora approval. We’ll activate you soon." }
  }
  if (rider.status !== "ACTIVE") {
    return { error: "Your rider account is not active. Contact Shopora." }
  }

  // Canonicalize stored phone to +233… so future logins are consistent
  const canonical = normalizePhone(phoneInput) || normalizePhone(rider.phone)
  if (canonical && rider.phone !== canonical) {
    const clash = await db.rider.findUnique({ where: { phone: canonical } })
    if (!clash) {
      await db.rider.update({ where: { id: rider.id }, data: { phone: canonical } })
    }
  }

  await setRiderSession(rider.id)
  return { success: true as const }
}

/** Public rider self-signup. Starts as PENDING until super-admin activates. */
export async function riderSignupAction(formData: FormData) {
  const { RIDER_TERMS_VERSION, RIDER_PLATFORM_CUT_PERCENT } = await import("@/lib/rider-terms")
  const name = String(formData.get("name") || "").trim()
  const phone = normalizePhone(String(formData.get("phone") || ""))
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const momoNumber = String(formData.get("momoNumber") || "").trim() || null
  const password = String(formData.get("password") || "")
  const confirm = String(formData.get("confirmPassword") || "")
  const acceptedTerms = String(formData.get("acceptTerms") || "") === "on" || String(formData.get("acceptTerms") || "") === "true"

  if (!name || name.length < 2) return { error: "Enter your full name." }
  if (!phone || phone.replace(/\D/g, "").length < 9) {
    return { error: "Enter a valid Ghana phone number." }
  }
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email so we can send you job alerts." }
  }
  if (password.length < 6) return { error: "Password must be at least 6 characters." }
  if (password !== confirm) return { error: "Passwords do not match." }
  if (!acceptedTerms) {
    return {
      error: `You must accept the rider terms, including Shopora’s ${RIDER_PLATFORM_CUT_PERCENT}% platform fee on each delivery.`,
    }
  }

  const existing = await db.rider.findUnique({ where: { phone } })
  if (existing) {
    return { error: "This phone number is already registered. Log in instead." }
  }

  try {
    await db.rider.create({
      data: {
        name,
        phone,
        email,
        momoNumber,
        type: "INDEPENDENT",
        status: "PENDING",
        isOnline: false,
        city: "Accra",
        termsAcceptedAt: new Date(),
        termsVersion: RIDER_TERMS_VERSION,
        passwordHash: await hash(password, 10),
      },
    })
  } catch (err) {
    console.error("riderSignupAction", err)
    return { error: "Could not create your account. Try again." }
  }

  const firstName = name.split(/\s+/)[0] || "there"
  try {
    const { RiderApplicationReceivedEmail } = await import("@/emails/RiderApplicationEmail")
    await Promise.all([
      resend.emails.send({
        from: "Shopora Delivery <orders@shopora.space>",
        to: email,
        subject: "We received your Shopora rider application",
        react: RiderApplicationReceivedEmail({ riderName: firstName }),
      }),
      resend.emails.send({
        from: "Shopora Delivery <orders@shopora.space>",
        to: "shoporaspace@gmail.com",
        subject: `New rider signup · ${name}`,
        html: `
          <p>A new Accra rider signed up and is waiting for approval.</p>
          <p><strong>Name:</strong> ${name}<br/>
          <strong>Phone:</strong> ${phone}<br/>
          <strong>Email:</strong> ${email}<br/>
          ${momoNumber ? `<strong>MoMo:</strong> ${momoNumber}<br/>` : ""}
          </p>
          <p><a href="https://www.shopora.space/super-admin/riders">Review in Super Admin → Riders</a></p>
        `,
      }),
    ])
  } catch (err) {
    console.error("rider signup emails:", err)
  }

  return { success: true as const }
}

export async function riderLogoutAction() {
  await clearRiderSession()
  redirect("/rider/login")
}

export async function setRiderOnlineAction(online: boolean) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }
  return setRiderOnline(auth.rider, online)
}

export async function acceptDeliveryJobAction(jobId: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }
  return acceptDeliveryJob(auth.rider, jobId)
}

export async function markJobPickedUpAction(jobId: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }
  return markJobPickedUp(auth.rider, jobId)
}

export async function markJobDeliveredAction(jobId: string, otpInput: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }
  return markJobDelivered(auth.rider, jobId, otpInput)
}

export async function reportFailedDeliveryAction(formData: FormData) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }
  return reportFailedDelivery(auth.rider, {
    jobId: String(formData.get("jobId") || ""),
    reason: String(formData.get("reason") || ""),
    notes: String(formData.get("notes") || ""),
  })
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

  const { RIDER_TERMS_VERSION } = await import("@/lib/rider-terms")

  try {
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
        termsAcceptedAt: new Date(),
        termsVersion: RIDER_TERMS_VERSION,
        passwordHash: await hash(password, 10),
      },
    })
  } catch (err) {
    console.error("createRiderAction", err)
    const msg = err instanceof Error ? err.message : ""
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { error: "A rider with this phone number already exists." }
    }
    return { error: "Could not save this rider. Check the details and try again." }
  }

  revalidatePath("/super-admin/riders")
  return { success: true }
}

export async function resetRiderPasswordAction(formData: FormData) {
  const auth = await requireSuperAdmin()
  if ("error" in auth) return { error: auth.error }

  const riderId = String(formData.get("riderId") || "")
  const password = String(formData.get("password") || "")
  if (!riderId) return { error: "Rider not found." }
  if (password.length < 6) return { error: "Password must be at least 6 characters." }

  const rider = await db.rider.findUnique({ where: { id: riderId }, select: { id: true, email: true, name: true } })
  if (!rider) return { error: "Rider not found." }

  await db.rider.update({
    where: { id: riderId },
    data: { passwordHash: await hash(password, 10) },
  })

  if (rider.email) {
    try {
      await resend.emails.send({
        from: "Shopora Delivery <orders@shopora.space>",
        to: rider.email,
        subject: "Your Shopora rider password was reset",
        html: `
          <p>Hi ${rider.name.split(/\s+/)[0] || "there"},</p>
          <p>A Shopora admin reset your rider login password.</p>
          <p><strong>New password:</strong> ${password}</p>
          <p>Log in at <a href="https://www.shopora.space/rider/login">https://www.shopora.space/rider/login</a> and keep this password private.</p>
        `,
      })
    } catch (err) {
      console.error("reset rider password email:", err)
    }
  }

  revalidatePath("/super-admin/riders")
  return { success: true as const }
}

export async function rateRiderAction(formData: FormData) {
  const trackingToken = String(formData.get("trackingToken") || "").trim()
  const stars = Number(formData.get("stars"))
  const comment = String(formData.get("comment") || "").trim() || null

  if (!trackingToken) return { error: "Missing tracking link." }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { error: "Choose a rating from 1 to 5 stars." }
  }

  const order = await db.order.findUnique({
    where: { trackingToken },
    include: {
      deliveryJob: {
        include: { rating: true },
      },
    },
  })
  if (!order?.deliveryJob || order.deliveryMethod !== "SHOPORA") {
    return { error: "Delivery not found." }
  }
  if (order.deliveryJob.status !== "DELIVERED" || !order.deliveryJob.riderId) {
    return { error: "You can rate only after the delivery is completed." }
  }
  if (order.deliveryJob.rating) {
    return { error: "You already rated this delivery." }
  }

  await db.$transaction(async (tx) => {
    await tx.riderRating.create({
      data: {
        deliveryJobId: order.deliveryJob!.id,
        riderId: order.deliveryJob!.riderId!,
        orderId: order.id,
        stars,
        comment,
      },
    })
    const agg = await tx.riderRating.aggregate({
      where: { riderId: order.deliveryJob!.riderId! },
      _avg: { stars: true },
      _count: { _all: true },
    })
    await tx.rider.update({
      where: { id: order.deliveryJob!.riderId! },
      data: {
        ratingAvg: Math.round((agg._avg.stars || stars) * 10) / 10,
        ratingCount: agg._count._all,
      },
    })
  })

  if (order.trackingToken) revalidatePath(`/track/${order.trackingToken}`)
  revalidatePath("/super-admin/riders")
  return { success: true as const }
}

export async function setRiderStatusAction(riderId: string, status: "ACTIVE" | "SUSPENDED" | "PENDING") {
  const { getServerSession } = await import("next-auth/next")
  const { authOptions } = await import("@/auth")
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  const admin = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } })
  if (admin?.platformRole !== "SUPER_ADMIN") return { error: "Unauthorized" }

  const before = await db.rider.findUnique({
    where: { id: riderId },
    select: { status: true, name: true, email: true },
  })
  if (!before) return { error: "Rider not found." }

  await db.rider.update({
    where: { id: riderId },
    data: {
      status,
      ...(status !== "ACTIVE" ? { isOnline: false } : {}),
    },
  })

  if (status === "ACTIVE" && before.status !== "ACTIVE" && before.email) {
    try {
      const { RiderApprovedEmail } = await import("@/emails/RiderApplicationEmail")
      await resend.emails.send({
        from: "Shopora Delivery <orders@shopora.space>",
        to: before.email,
        subject: "You’re approved as a Shopora rider",
        react: RiderApprovedEmail({
          riderName: before.name.split(/\s+/)[0] || "there",
          loginUrl: "https://www.shopora.space/rider/login",
        }),
      })
    } catch (err) {
      console.error("rider approved email:", err)
    }
  }

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

  const { reopenDeliveryJobInternal } = await import("@/lib/delivery-reassign")
  const result = await reopenDeliveryJobInternal({
    jobId,
    actorType: "ADMIN",
    actorId: auth.userId,
    reason: "Admin reopened for new rider accept",
    action: "REOPENED",
  })
  if ("error" in result) return { error: result.error }

  revalidatePath("/rider")
  revalidatePath("/rider/history")
  revalidatePath("/super-admin/deliveries")
  if (result.trackingToken) revalidatePath(`/track/${result.trackingToken}`)
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

  const { notifyRiderJobCancelled } = await import("@/lib/delivery-notifications")
  await notifyRiderJobCancelled(jobId)

  revalidatePath("/rider")
  revalidatePath("/rider/history")
  revalidatePath("/super-admin/deliveries")
  return { success: true }
}
