"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleReviewStatusAction(storeId: string, reviewId: string, isHidden: boolean) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.review.update({
    where: { id: reviewId, storeId },
    data: { status: isHidden ? "HIDDEN" : "PUBLISHED" }
  })

  revalidatePath(`/${storeId}/reviews`)
  return { success: true }
}

export async function deleteReviewAction(storeId: string, reviewId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.review.delete({
    where: { id: reviewId, storeId }
  })

  revalidatePath(`/${storeId}/reviews`)
  return { success: true }
}
