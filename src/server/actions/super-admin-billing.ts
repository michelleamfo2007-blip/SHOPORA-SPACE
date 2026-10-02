"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function approvePaymentAction(paymentId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admins only.")
  }

  const payment = await db.subscriptionPayment.findUnique({
    where: { id: paymentId },
    include: {
      subscription: {
        include: {
          plan: true,
          store: {
            include: {
              members: { where: { role: "OWNER" }, include: { user: true } },
            },
          },
        },
      },
    },
  })

  if (!payment) throw new Error("Payment not found")

  // Update payment to APPROVED
  await db.subscriptionPayment.update({
    where: { id: paymentId },
    data: { status: "APPROVED" }
  })

  // Update Subscription to ACTIVE
  const currentDate = new Date()
  const currentEnd = payment.subscription.currentPeriodEnd
  const renewFrom =
    payment.subscription.status === "ACTIVE" && currentEnd && currentEnd > currentDate ? currentEnd : currentDate

  const nextEnd = new Date(renewFrom)
  nextEnd.setMonth(nextEnd.getMonth() + 1)

  const isEarlyBirdActive = payment.subscription.isEarlyBird && payment.subscription.earlyBirdMonthsUsed < 2;

  await db.subscription.update({
    where: { id: payment.subscriptionId },
    data: {
      status: "ACTIVE",
      currentPeriodEnd: nextEnd,
      ...(isEarlyBirdActive ? { earlyBirdMonthsUsed: { increment: 1 } } : {})
    }
  })

  const owner = payment.subscription.store.members[0]?.user
  if (owner?.email) {
    try {
      await resend.emails.send({
        from: "Shopora Billing <billing@shopora.space>",
        to: owner.email,
        subject: `Your ${payment.subscription.store.name} subscription is active`,
        html: `
          <p>Hi ${owner.name || "there"},</p>
          <p>Your payment for <strong>${payment.subscription.store.name}</strong> has been approved.</p>
          <p><strong>Plan:</strong> ${payment.subscription.plan.name}</p>
          <p><strong>Amount:</strong> GHS ${payment.amount.toFixed(2)}</p>
          <p><strong>Active until:</strong> ${nextEnd.toLocaleDateString()}</p>
          <p>You can open your store dashboard here:<br><a href="https://shopora.space/dashboard">https://shopora.space/dashboard</a></p>
        `,
      })
    } catch (error) {
      console.error("Failed to send subscription approval email:", error)
    }
  }

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
