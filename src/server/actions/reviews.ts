"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireStoreAccess } from "@/lib/store-access"
import { addManualReview } from "@/lib/review-service"
import { getStoreByHost } from "@/lib/tenant"

export async function toggleReviewStatusAction(storeId: string, reviewId: string, isHidden: boolean) {
  await requireStoreAccess(storeId)

  await db.review.update({
    where: { id: reviewId, storeId },
    data: { status: isHidden ? "HIDDEN" : "PUBLISHED" }
  })

  revalidatePath(`/${storeId}/reviews`)
  return { success: true }
}

export async function deleteReviewAction(storeId: string, reviewId: string) {
  await requireStoreAccess(storeId)

  await db.review.delete({
    where: { id: reviewId, storeId }
  })

  revalidatePath(`/${storeId}/reviews`)
  return { success: true }
}

export async function addManualReviewAction(storeId: string, data: { customerName: string, rating: number, comment: string, productId?: string }) {
  await requireStoreAccess(storeId)

  const result = await addManualReview(storeId, data)
  if ("error" in result) throw new Error(result.error)

  revalidatePath(`/${storeId}/reviews`)
  return { success: true }
}

export async function submitStorefrontReviewAction(domain: string, data: { customerName: string, rating: number, comment: string, productId: string }) {
  // Storefronts are addressed by slug/subdomain; custom domains are a fallback.
  const store =
    (await getStoreByHost(domain)) ??
    (await db.domain.findUnique({ where: { domainName: domain }, include: { store: true } }).then((d) => d?.store))
  if (!store) return { error: "Store not found." }

  const customerName = data.customerName.trim().slice(0, 80)
  const comment = data.comment.trim().slice(0, 1000)
  const rating = Math.round(Number(data.rating))
  if (!customerName || !comment) return { error: "Add your name and a short review." }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return { error: "Choose 1 to 5 stars." }

  const product = await db.product.findFirst({ where: { id: data.productId, storeId: store.id }, select: { id: true } })
  if (!product) return { error: "Product not found." }

  let customer = await db.customer.findFirst({ where: { storeId: store.id, name: customerName } })
  if (!customer) {
    customer = await db.customer.create({ data: { storeId: store.id, name: customerName } })
  }

  // Published straight away; the seller can hide it from the dashboard or app.
  await db.review.create({
    data: {
      storeId: store.id,
      customerId: customer.id,
      productId: product.id,
      rating,
      comment,
      status: "PUBLISHED",
    }
  })

  revalidatePath(`/${store.id}/reviews`)
  revalidatePath("/", "layout")
  return { success: true as const }
}
