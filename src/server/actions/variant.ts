"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createVariantAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const productId = formData.get("productId") as string
  const storeId = formData.get("storeId") as string
  const name = formData.get("name") as string
  const price = parseFloat(formData.get("price") as string)
  const stockCount = parseInt(formData.get("stockCount") as string)
  const sku = formData.get("sku") as string

  if (!productId || !storeId || !name || isNaN(price)) {
    throw new Error("Missing required fields")
  }

  // Verify access
  const storeMember = await db.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId: session.user.id } }
  })
  if (!storeMember) throw new Error("Unauthorized access")

  await db.productVariant.create({
    data: {
      productId,
      name,
      price,
      stockCount: isNaN(stockCount) ? 0 : stockCount,
      sku
    }
  })

  revalidatePath(`/${storeId}/products/${productId}`)
}
