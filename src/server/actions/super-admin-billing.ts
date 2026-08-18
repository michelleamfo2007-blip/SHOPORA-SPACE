"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"

export async function approvePaymentAction(paymentId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admins only.")
  }

  const payment = await db.subscriptionPayment.findUnique({
    where: { id: paymentId },
    include: { subscription: { include: { plan: true } } }
  })

  if (!payment) throw new Error("Payment not found")

  // Update payment to APPROVED
  await db.subscriptionPayment.update({
    where: { id: paymentId },
    data: { status: "APPROVED" }
  })

  // Update Subscription to ACTIVE
  // Calculate new end date based on plan interval (assuming 1 month)
  const currentDate = new Date()
  const currentEnd = payment.subscription.currentPeriodEnd
  
  let nextEnd = new Date()
  if (currentEnd && currentEnd > currentDate) {
    // Add to existing
    nextEnd = new Date(currentEnd)
    nextEnd.setMonth(nextEnd.getMonth() + 1)
  } else {
    // Start from today
    nextEnd.setMonth(nextEnd.getMonth() + 1)
  }

  await db.subscription.update({
    where: { id: payment.subscriptionId },
    data: {
      status: "ACTIVE",
      currentPeriodEnd: nextEnd
    }
  })

  revalidatePath("/super-admin/subscriptions")
  return { success: true }
}

export async function rejectPaymentAction(paymentId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admins only.")
  }

  await db.subscriptionPayment.update({
    where: { id: paymentId },
    data: { status: "REJECTED" }
  })

  revalidatePath("/super-admin/subscriptions")
  return { success: true }
}
