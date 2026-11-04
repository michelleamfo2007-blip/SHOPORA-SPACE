"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { requireStoreAccess } from "@/lib/store-access"
import { storeSettingsFromFormData, updateStoreSettings } from "@/lib/store-settings"

export async function createStoreAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const country = formData.get("country") as string
  const currency = formData.get("currency") as string

  if (!name || !slug || !country || !currency) {
    throw new Error("Missing required fields")
  }

  // Prevent reserved subdomain names
  const reservedSlugs = ["www", "api", "app", "admin", "super-admin", "mail", "ftp", "blog", "shop", "store", "checkout"]
  if (reservedSlugs.includes(slug.toLowerCase())) {
    throw new Error("This store URL is reserved and cannot be used")
  }

  // Check if slug is taken
  const existingStore = await db.store.findUnique({
    where: { slug }
  })

  if (existingStore) {
    throw new Error("Store URL is already taken")
  }

  // Create the store and assign the user as the OWNER
  const store = await db.store.create({
    data: {
      name,
      slug,
      country,
      currency,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER"
        }
      }
    }
  })

  // Redirect to the newly created store dashboard
  redirect(`/${store.id}`)
}

export async function updateStoreBrandingAction(storeId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { member: membership } = await requireStoreAccess(storeId)

  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Unauthorized to manage store settings")
  }

  try {
    await updateStoreSettings(storeId, storeSettingsFromFormData(formData))
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update store settings:", error)
    throw new Error(error.message || "Failed to update settings")
  }
}

export async function completeSetupAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const rawSlug = formData.get("slug") as string
  const country = formData.get("country") as string
  const currency = formData.get("currency") as string

  if (!name || !rawSlug || !country || !currency) {
    return { error: "Missing required fields" }
  }

  // Sanitize slug: lowercase, replace spaces with hyphens, remove non-alphanumeric
  const slug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, "") // remove special characters except spaces/hyphens
    .replace(/\s+/g, "-")         // replace spaces with hyphens
    .replace(/-+/g, "-")          // replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "")      // trim hyphens

  if (!slug) {
    return { error: "Please enter a valid store URL containing only letters and numbers" }
  }

  const reservedSlugs = ["www", "api", "app", "admin", "super-admin", "mail", "ftp", "blog", "shop", "store", "checkout"]
  if (reservedSlugs.includes(slug.toLowerCase())) {
    return { error: "This store URL is reserved and cannot be used" }
  }

  // Check if slug is taken by someone else
  const existingStore = await db.store.findUnique({
    where: { slug }
  })

  if (existingStore) {
    return { error: "Store URL is already taken" }
  }

  // Find the draft store for this user
  const membership = await db.storeMember.findFirst({
    where: { 
      userId: session.user.id,
      store: { slug: { startsWith: "draft-" } }
    },
    include: { store: true }
  })

  if (!membership || !membership.store) {
    return { error: "No draft store found. Please select a package first." }
  }

  const storeId = membership.store.id

  try {
    await db.store.update({
      where: { id: storeId },
      data: {
        name,
        slug,
        country,
        currency
      }
    })
    
    return { redirectUrl: `/${storeId}` }
  } catch (error: any) {
    console.error("Store setup failed:", error)
    return { error: error.message || "Failed to update store details. Please try again." }
  }
}
