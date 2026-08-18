"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { resend } from "@/lib/resend"

export async function startTrialAction(planName: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("You must be logged in to start a trial.")
  }

  const userId = session.user.id
  const user = await db.user.findUnique({ where: { id: userId } })

  if (!user || !user.email) {
    throw new Error("User not found or email missing.")
  }

  // 1. Find or create the plan
  let plan = await db.subscriptionPlan.findFirst({
    where: { name: planName }
  })

  if (!plan) {
    // create placeholder plan if it doesn't exist
    const defaultPrices: Record<string, number> = {
      Starter: 29.99,
      Professional: 79.99,
      Business: 199.99
    }
    plan = await db.subscriptionPlan.create({
      data: {
        name: planName,
        price: defaultPrices[planName] || 0,
      }
    })
  }

  // 2. Create a "Draft" Store
  // We use a temporary random slug that they will change during the setup step
  const tempSlug = `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const store = await db.store.create({
    data: {
      name: "My Shopora Store",
      slug: tempSlug,
      country: "GH",
      currency: "GHS",
      members: {
        create: {
          userId: userId,
          role: "OWNER"
        }
      }
    }
  })

  // 3. Create Subscription (7-day trial)
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7)

  await db.subscription.create({
    data: {
      storeId: store.id,
      planId: plan.id,
      status: "TRIAL",
      currentPeriodEnd: endDate,
    }
  })

  // 4. Send Email Notification
  try {
    await resend.emails.send({
      from: "Shopora <billing@shopora.space>",
      to: user.email,
      subject: "Your Shopora 7-day free trial has started 🎉",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #1e293b; line-height: 1.5;">
          <h2>Your Shopora 7-day free trial has started 🎉</h2>
          <p>Hi ${user.name || user.email.split('@')[0]},</p>
          <p>You currently have access to the <strong>${planName}</strong> plan.</p>
          <p>Your trial ends on <strong>${endDate.toLocaleDateString()}</strong>.</p>
          <p>After your 7-day trial, your subscription will need to be renewed manually to keep your store active.</p>
          <p>Click below to finish setting up your store:</p>
          <a href="https://shopora.space/onboarding" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Complete Store Setup</a>
        </div>
      `
    })
  } catch (err) {
    console.error("Failed to send trial start email", err)
  }

  // 5. Redirect to store setup
  redirect("/onboarding")
}

export async function submitPaymentReference(storeId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const method = formData.get("paymentMethod") as string
  const reference = formData.get("reference") as string
  
  if (!method || !reference) {
    throw new Error("Payment method and reference are required")
  }

  // Find the store and subscription
  const store = await db.store.findUnique({
    where: { id: storeId },
    include: { subscription: { include: { plan: true } } }
  })

  if (!store || !store.subscription) {
    throw new Error("No subscription found for this store.")
  }

  // Create the payment record
  await db.subscriptionPayment.create({
    data: {
      subscriptionId: store.subscription.id,
      amount: store.subscription.plan.price,
      status: "PENDING",
      paymentMethod: method,
      reference: reference,
    }
  })

  // We do NOT update the subscription status here.
  // The super admin must approve it manually.

  revalidatePath(`/${storeId}/billing`)
  return { success: true }
}
