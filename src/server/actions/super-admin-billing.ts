"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { formatBillingDate } from "@/lib/subscription"

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
          <p><strong>Active until:</strong> ${formatBillingDate(nextEnd)}</p>
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

  const payment = await db.subscriptionPayment.update({
    where: { id: paymentId },
    data: { status: "REJECTED" },
    include: {
      subscription: {
        include: {
          store: {
            include: {
              members: { where: { role: "OWNER" }, include: { user: true } },
            },
          },
        },
      },
    },
  })

  const store = payment.subscription.store
  const owner = store.members[0]?.user
  if (owner?.email) {
    const billingUrl = `https://shopora.space/${store.id}/billing`
    try {
      await resend.emails.send({
        from: "Shopora Billing <billing@shopora.space>",
        to: owner.email,
        subject: `We couldn't confirm your ${store.name} payment`,
        html: `
          <p>Hi ${owner.name || "there"},</p>
          <p>We couldn't confirm your payment of <strong>GHS ${payment.amount.toFixed(2)}</strong> for <strong>${store.name}</strong> (reference: ${payment.reference}), so it has not been approved.</p>
          <p>Please check that the amount and transaction reference are correct, then submit your payment again from your Billing page:<br><a href="${billingUrl}">${billingUrl}</a></p>
          <p>If you think this is a mistake, contact <a href="mailto:support@shopora.space">support@shopora.space</a>.</p>
        `,
      })
    } catch (error) {
      console.error("Failed to send payment rejection email:", error)
    }
  }

  revalidatePath("/super-admin/subscriptions")
  return { success: true }
}
