"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireStoreAccess } from "@/lib/store-access"
import { redirect } from "next/navigation"

export async function createDiscountAction(storeId: string, formData: FormData) {
  await requireStoreAccess(storeId)

  const code = formData.get("code") as string
  const type = formData.get("type") as string
  const value = parseFloat(formData.get("value") as string)
  const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null

  if (!code || !type || isNaN(value)) {
    throw new Error("Missing required fields")
  }

  await db.discount.create({
    data: {
      storeId,
      code: code.toUpperCase().replace(/\s+/g, ''),
      type,
      value,
      usageLimit
    }
  })

  revalidatePath(`/${storeId}/discounts`)
  redirect(`/${storeId}/discounts`)
}

export async function toggleDiscountAction(storeId: string, discountId: string, isActive: boolean) {
  await requireStoreAccess(storeId)

  await db.discount.update({
    where: { id: discountId, storeId },
    data: { isActive }
  })

  revalidatePath(`/${storeId}/discounts`)
  return { success: true }
}

export async function deleteDiscountAction(storeId: string, discountId: string) {
  await requireStoreAccess(storeId)

  await db.discount.delete({
    where: { id: discountId, storeId }
  })

  revalidatePath(`/${storeId}/discounts`)
  return { success: true }
}
