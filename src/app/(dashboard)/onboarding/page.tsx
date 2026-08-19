import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./OnboardingClient";
import { db } from "@/lib/db"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Check if they are a member of any store
  const storeMember = await db.storeMember.findFirst({
    where: { userId: session.user.id }
  })

  // If they have a store, check if it's draft or completed
  if (storeMember) {
    const store = await db.store.findUnique({
      where: { id: storeMember.storeId }
    })
    
    // If store setup is already completed, redirect to the dashboard
    if (store && !store.slug.startsWith("draft-")) {
      redirect(`/${store.id}`)
    }
    
    // If it's a draft store, allow them to complete the setup
    return <OnboardingClient />
  }

  // If they have no store membership (meaning they haven't selected a plan), redirect to packages
  redirect("/onboarding/packages")
}
