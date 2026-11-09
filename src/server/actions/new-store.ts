"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { checkStoreSlug, createStoreWithTrial } from "@/lib/store-onboarding"

export async function checkStoreSlugAction(slug: string) {
  const { slug: clean, error } = await checkStoreSlug(slug)
  return { slug: clean, available: !error, reason: error }
}

/** Adds another store to the signed-in seller's account, with its own free month. */
export async function createAnotherStoreAction(input: { name: string; slug: string; planName: string; interval: string; currency: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Please log in again." }
  try {
    const result = await createStoreWithTrial(session.user.id, input)
    if ("error" in result) return { error: result.error }
    return { storeId: result.store.id }
  } catch (err) {
    console.error("Failed to create another store", err)
    return { error: "Could not create the store. Try again." }
  }
}
