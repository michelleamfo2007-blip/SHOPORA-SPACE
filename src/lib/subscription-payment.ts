import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { resend } from "@/lib/resend"

export function amountDue(subscription: { isEarlyBird: boolean; earlyBirdMonthsUsed: number; plan: { price: number } }) {
  const isEarlyBirdActive = subscription.isEarlyBird && subscription.earlyBirdMonthsUsed < 2
  return { amount: isEarlyBirdActive ? 50 : subscription.plan.price, isEarlyBirdActive }
}

/** Seller says they paid their Shopora subscription; super admin verifies it. Callers must check membership first. */
export async function submitSubscriptionPayment(
  storeId: string,
  input: { method: string; reference: string; userEmail?: string | null }
) {
  const method = input.method.trim()
  const reference = input.reference.trim()
  if (!method || !reference) return { error: "Payment method and reference are required" }

  const store = await db.store.findUnique({
    where: { id: storeId },
    include: { subscription: { include: { plan: true } } },
  })
  if (!store || !store.subscription) return { error: "No subscription found for this store." }

  const { amount: expectedAmount } = amountDue(store.subscription)

  await db.subscriptionPayment.create({
    data: {
      subscriptionId: store.subscription.id,
      amount: expectedAmount,
      status: "PENDING",
      paymentMethod: method,
      reference,
    },
  })

  try {
    const emailPromises = []

    if (input.userEmail) {
      emailPromises.push(
        resend.emails.send({
          from: "Shopora Billing <billing@shopora.space>",
          to: input.userEmail,
          subject: `Subscription Payment Submitted - ${store.name}`,
          html: `
            <p>Hi there,</p>
            <p>We have successfully received your payment reference for your Shopora subscription.</p>
            <p><strong>Amount:</strong> GHS ${expectedAmount.toFixed(2)}</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <p>Our team is currently verifying the payment. Your subscription will be activated shortly.</p>
          `,
        })
      )
    }

    emailPromises.push(
      resend.emails.send({
        from: "Shopora System <billing@shopora.space>",
        to: "shoporaspace@gmail.com",
        subject: `New Subscription Payment Pending`,
        html: `
          <p>A tenant has submitted a manual payment reference for their subscription.</p>
          <p><strong>Store:</strong> ${store.name} (${store.slug})</p>
          <p><strong>Plan:</strong> ${store.subscription.plan.name}</p>
          <p><strong>Amount due:</strong> GHS ${expectedAmount.toFixed(2)}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p>Log in to the Super Admin dashboard (Subscriptions tab) to verify and approve the payment.</p>
        `,
      })
    )

    await Promise.all(emailPromises)
  } catch (err) {
    console.error("Failed to send subscription payment notification emails", err)
  }

  // Subscription status is not changed here; the super admin approves it manually.
  revalidatePath(`/${storeId}/billing`)
  return { success: true as const }
}
