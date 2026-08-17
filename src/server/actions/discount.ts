"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createDiscountAction(storeId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify store access
  const storeMember = await db.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId: session.user.id } }
  })

  if (!storeMember) {
    throw new Error("Unauthorized")
  }

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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.discount.update({
    where: { id: discountId, storeId },
    data: { isActive }
  })

  revalidatePath(`/${storeId}/discounts`)
  return { success: true }
}

export async function deleteDiscountAction(storeId: string, discountId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.discount.delete({
    where: { id: discountId, storeId }
  })

  revalidatePath(`/${storeId}/discounts`)
  return { success: true }
}
