"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function createProductAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const storeId = formData.get("storeId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const sku = formData.get("sku") as string
  const stockCount = parseInt(formData.get("stockCount") as string)
  const isActive = formData.get("isActive") === "on"

  if (!storeId || !name || isNaN(price)) {
    throw new Error("Missing required fields")
  }

  // Verify user is authorized for this store
  const storeMember = await db.storeMember.findUnique({
    where: {
      storeId_userId: {
        storeId,
        userId: session.user.id
      }
    }
  })

  if (!storeMember) {
    throw new Error("Unauthorized access to this store")
  }

  // Create product with a single default variant
  await db.product.create({
    data: {
      storeId,
      name,
      description,
      isActive,
      variants: {
        create: {
          name: "Default",
          price,
          sku,
          stockCount: isNaN(stockCount) ? 0 : stockCount
        }
      }
    }
  })

  redirect(`/${storeId}/products`)
}
