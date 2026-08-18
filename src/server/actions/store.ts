"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation"

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

  // Verify ownership or admin access
  const membership = await db.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId: session.user.id } }
  })

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    throw new Error("Unauthorized to manage store settings")
  }

  const description = formData.get("description") as string | null
  const logoUrl = formData.get("logoUrl") as string | null
  const primaryColor = formData.get("primaryColor") as string | null

  await db.store.update({
    where: { id: storeId },
    data: {
      description,
      logoUrl,
      primaryColor: primaryColor || "#2563eb"
    }
  })

  return { success: true }
}
