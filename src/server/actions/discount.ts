"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireStoreManager } from "@/lib/store-access"
import { redirect } from "next/navigation"
import { createDiscount } from "@/lib/discount-service"

export async function createDiscountAction(storeId: string, formData: FormData) {
  await requireStoreManager(storeId)

  const code = formData.get("code") as string
  const type = formData.get("type") as string
  const value = parseFloat(formData.get("value") as string)
  const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null

  const result = await createDiscount(storeId, { code: code || "", type: type || "", value, usageLimit })
  if ("error" in result) throw new Error(result.error)

  revalidatePath(`/${storeId}/discounts`)
  redirect(`/${storeId}/discounts`)
}

export async function toggleDiscountAction(storeId: string, discountId: string, isActive: boolean) {
  await requireStoreManager(storeId)

  await db.discount.update({
    where: { id: discountId, storeId },
    data: { isActive }
  })

  revalidatePath(`/${storeId}/discounts`)
  return { success: true }
}

export async function deleteDiscountAction(storeId: string, discountId: string) {
  await requireStoreManager(storeId)

  await db.discount.delete({
    where: { id: discountId, storeId }
  })

  revalidatePath(`/${storeId}/discounts`)
  return { success: true }
}
