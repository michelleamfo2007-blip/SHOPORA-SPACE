"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { submitSubscriptionPayment } from "@/lib/subscription-payment"
import { DEFAULT_BRAND_COLOR } from "@/lib/store-brand"
import { findOrCreatePlan, sendTrialStartedEmails, startTrialSubscription } from "@/lib/store-onboarding"

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
  const plan = await findOrCreatePlan(planName, interval)

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
  const endDate = await startTrialSubscription(store.id, plan.id)

  // 4. Send Email Notification
  await sendTrialStartedEmails({ name: user.name, email: user.email }, planName, endDate, { needsSetup: true })

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
  if (membership.role === "STAFF") throw new Error("Only the store owner or an admin can pay for the plan.")

  const result = await submitSubscriptionPayment(storeId, {
    method: (formData.get("paymentMethod") as string) || "",
    reference: (formData.get("reference") as string) || "",
    userEmail: session.user.email,
  })
  if ("error" in result) throw new Error(result.error)

  return { success: true }
}
