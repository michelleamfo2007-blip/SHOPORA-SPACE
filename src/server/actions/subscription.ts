"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { resend } from "@/lib/resend"
import { submitSubscriptionPayment } from "@/lib/subscription-payment"
import { DEFAULT_BRAND_COLOR } from "@/lib/store-brand"

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
      Starter: { month: 100, year: 1100 },
      Professional: { month: 200, year: 2200 },
      Business: { month: 300, year: 3300 }
    }
    const safeInterval = interval === "year" ? "year" : "month"
    
    plan = await db.subscriptionPlan.create({
      data: {
        name: planName,
        price: defaultPrices[planName]?.[safeInterval] || 0,
        currency: "GHS",
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
      primaryColor: DEFAULT_BRAND_COLOR,
      members: {
        create: {
          userId: userId,
          role: "OWNER"
        }
      }
    }
  })

  // 3. Create Subscription (1-month trial)
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  // Check for Early Bird availability
  const earlyBirdCount = await db.subscription.count({
    where: { isEarlyBird: true }
  })
  const isEarlyBird = earlyBirdCount < 15

  await db.subscription.create({
    data: {
      storeId: store.id,
      planId: plan.id,
      status: "TRIAL",
      currentPeriodEnd: endDate,
      isEarlyBird: isEarlyBird,
    }
  })

  // 4. Send Email Notification
  try {
    await resend.emails.send({
      from: "Michelle from Shopora <billing@shopora.space>",
      to: user.email,
      subject: "Your Shopora 1-month free trial has started",
      html: `
        <p>Hi ${user.name || user.email.split('@')[0]},</p>
        <p>Your Shopora 1-month free trial has started!</p>
        <p>You currently have access to the ${planName} plan.</p>
        <p>Your trial ends on ${endDate.toLocaleDateString()}. After your 1-month trial, your subscription will need to be renewed manually to keep your store active.</p>
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

  const membership = await db.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId: session.user.id } },
  })
  if (!membership) throw new Error("Unauthorized")

  const result = await submitSubscriptionPayment(storeId, {
    method: (formData.get("paymentMethod") as string) || "",
    reference: (formData.get("reference") as string) || "",
    userEmail: session.user.email,
  })
  if ("error" in result) throw new Error(result.error)

  return { success: true }
}
