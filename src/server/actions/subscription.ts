"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { resend } from "@/lib/resend"

export async function startTrialAction(planName: string, interval: string = "month") {
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
    where: { name: planName, interval: interval === "year" ? "year" : "month" }
  })

  if (!plan) {
    const defaultPrices: Record<string, Record<string, number>> = {
      Starter: { month: 150, year: 1650 },
      Professional: { month: 250, year: 2750 },
      Business: { month: 350, year: 3850 }
    }
    const safeInterval = interval === "year" ? "year" : "month"
    
    plan = await db.subscriptionPlan.create({
      data: {
        name: planName,
        price: defaultPrices[planName]?.[safeInterval] || 0,
        interval: safeInterval,
      }
    })
  }

  // Find if they already have a draft store and clean it up to prevent duplicates
  const existingDraftMembership = await db.storeMember.findFirst({
    where: {
      userId: userId,
      store: { slug: { startsWith: "draft-" } }
    }
  })

  if (existingDraftMembership) {
    await db.store.delete({
      where: { id: existingDraftMembership.storeId }
    }).catch((err) => console.error("Failed to delete old draft store:", err))
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
      from: "Michelle from Shopora <billing@shopora.space>",
      to: user.email,
      subject: "Your Shopora 7-day free trial has started",
      html: `
        <p>Hi ${user.name || user.email.split('@')[0]},</p>
        <p>Your Shopora 7-day free trial has started!</p>
        <p>You currently have access to the ${planName} plan.</p>
        <p>Your trial ends on ${endDate.toLocaleDateString()}. After your 7-day trial, your subscription will need to be renewed manually to keep your store active.</p>
        <p>Click here to finish setting up your store:<br><a href="https://shopora.space/onboarding">https://shopora.space/onboarding</a></p>
        <p>Best,<br>Michelle</p>
      `
    })

    // Notify Super Admin
    await resend.emails.send({
      from: 'Shopora System <billing@shopora.space>',
      to: 'shoporaspace@gmail.com',
      subject: 'New Store Created / Trial Started',
      html: `
        <p>A new client has successfully created a store and started their trial!</p>
        <p><strong>Client:</strong> ${user.name} (${user.email})</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p>Log in to the Super Admin dashboard to view more details.</p>
      `
    })
  } catch (err) {
    console.error("Failed to send trial start emails", err)
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

  // Send Notifications
  try {
    const emailPromises = []
    
    // Notify Tenant Admin (Receipt)
    if (session.user.email) {
      emailPromises.push(
        resend.emails.send({
          from: "Shopora Billing <billing@shopora.space>",
          to: session.user.email,
          subject: `Subscription Payment Submitted - ${store.name}`,
          html: `
            <p>Hi there,</p>
            <p>We have successfully received your payment reference for your Shopora subscription.</p>
            <p><strong>Amount:</strong> ${store.currency || "GHS"} ${store.subscription.plan.price}</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <p>Our team is currently verifying the payment. Your subscription will be activated shortly.</p>
          `
        })
      )
    }

    // Notify Super Admin
    emailPromises.push(
      resend.emails.send({
        from: "Shopora System <billing@shopora.space>",
        to: "shoporaspace@gmail.com",
        subject: `New Subscription Payment Pending`,
        html: `
          <p>A tenant has submitted a manual payment reference for their subscription.</p>
          <p><strong>Store:</strong> ${store.name} (${store.slug})</p>
          <p><strong>Plan:</strong> ${store.subscription.plan.name}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p>Log in to the Super Admin dashboard (Subscriptions tab) to verify and approve the payment.</p>
        `
      })
    )

    await Promise.all(emailPromises)
  } catch (err) {
    console.error("Failed to send subscription payment notification emails", err)
  }

  // We do NOT update the subscription status here.
  // The super admin must approve it manually.

  revalidatePath(`/${storeId}/billing`)
  return { success: true }
}
