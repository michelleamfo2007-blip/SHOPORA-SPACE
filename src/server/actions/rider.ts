"use server"

import { hash, compare } from "bcryptjs"
import { db } from "@/lib/db"
import { clearRiderSession, requireRider, setRiderSession } from "@/lib/rider-session"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim()
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

/** First rider to accept wins. Others get "already taken". */
export async function acceptDeliveryJobAction(jobId: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }
  const { rider } = auth

  const job = await db.deliveryJob.findUnique({
    where: { id: jobId },
    include: { order: { select: { status: true, deliveryMethod: true, orderNumber: true } } },
  })
  if (!job || job.order.deliveryMethod !== "SHOPORA") {
    return { error: "Job not found." }
  }
  if (job.status !== "PENDING" || job.riderId) {
    return { error: "Another rider already accepted this delivery." }
  }
  if (job.order.status !== "PROCESSING") {
    return { error: "This order is not ready for pickup yet. Wait until the store confirms payment." }
  }

  const claimed = await db.deliveryJob.updateMany({
    where: { id: jobId, status: "PENDING", riderId: null },
    data: {
      riderId: rider.id,
      status: "ASSIGNED",
      assignedAt: new Date(),
    },
  })

  if (claimed.count === 0) {
    return { error: "Another rider already accepted this delivery." }
  }

  revalidatePath("/rider")
  return { success: true, orderNumber: job.order.orderNumber }
}

export async function markJobPickedUpAction(jobId: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }

  const job = await db.deliveryJob.findUnique({
    where: { id: jobId },
    include: { order: true },
  })
  if (!job || job.riderId !== auth.rider.id) return { error: "This job is not yours." }
  if (job.status !== "ASSIGNED") return { error: "Pick up is only available after you accept the job." }

  await db.$transaction([
    db.deliveryJob.update({
      where: { id: jobId },
      data: { status: "PICKED_UP", pickedUpAt: new Date() },
    }),
    db.order.update({
      where: { id: job.orderId },
      data: { status: "SHIPPED" },
    }),
  ])

  revalidatePath("/rider")
  revalidatePath(`/track/${job.order.trackingToken}`)
  return { success: true }
}

export async function markJobDeliveredAction(jobId: string) {
  const auth = await requireRider()
  if ("error" in auth) return { error: auth.error }

  const job = await db.deliveryJob.findUnique({
    where: { id: jobId },
    include: { order: true },
  })
  if (!job || job.riderId !== auth.rider.id) return { error: "This job is not yours." }
  if (job.status !== "PICKED_UP" && job.status !== "ASSIGNED") {
    return { error: "This job cannot be marked delivered." }
  }

  await db.$transaction([
    db.deliveryJob.update({
      where: { id: jobId },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    }),
    db.order.update({
      where: { id: job.orderId },
      data: { status: "DELIVERED" },
    }),
    db.riderWalletEntry.create({
      data: {
        riderId: auth.rider.id,
        deliveryJobId: jobId,
        type: "DELIVERY_CUT",
        amount: job.shoporaCut,
        note: `Cut from ${job.order.orderNumber}`,
      },
    }),
    db.rider.update({
      where: { id: auth.rider.id },
      data: { walletOwed: { increment: job.shoporaCut } },
    }),
  ])

  revalidatePath("/rider")
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

  await db.rider.update({ where: { id: riderId }, data: { status } })
  revalidatePath("/super-admin/riders")
  return { success: true }
}

async function requireSuperAdmin() {
  const { getServerSession } = await import("next-auth/next")
  const { authOptions } = await import("@/auth")
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" as const }
  const admin = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } })
  if (admin?.platformRole !== "SUPER_ADMIN") return { error: "Unauthorized" as const }
  return { ok: true as const }
}

/** Record that a rider MoMo'd Shopora their platform cut. */
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
