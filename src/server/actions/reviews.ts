"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireStoreAccess } from "@/lib/store-access"

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

  // Find or create customer
  let customer = await db.customer.findFirst({ where: { storeId, name: data.customerName } })
  if (!customer) {
    customer = await db.customer.create({ data: { storeId, name: data.customerName } })
  }

  // If no product is specified, just pick the first active product (or none if schema allows, but productId is required in schema)
  let prodId = data.productId
  if (prodId) {
    const product = await db.product.findFirst({ where: { id: prodId, storeId } })
    if (!product) throw new Error("Product not found")
  } else {
    const p = await db.product.findFirst({ where: { storeId } })
    if (p) prodId = p.id
    else throw new Error("Store has no products to review.")
  }

  await db.review.create({
    data: {
      storeId,
      customerId: customer.id,
      productId: prodId,
      rating: data.rating,
      comment: data.comment,
      status: "PUBLISHED"
    }
  })

  revalidatePath(`/${storeId}/reviews`)
  return { success: true }
}

export async function submitStorefrontReviewAction(domain: string, data: { customerName: string, rating: number, comment: string, productId: string }) {
  const store = await db.domain.findUnique({ where: { domainName: domain }, include: { store: true } }).then(d => d?.store)
  if (!store) throw new Error("Store not found")

  let customer = await db.customer.findFirst({ where: { storeId: store.id, name: data.customerName } })
  if (!customer) {
    customer = await db.customer.create({ data: { storeId: store.id, name: data.customerName } })
  }

  await db.review.create({
    data: {
      storeId: store.id,
      customerId: customer.id,
      productId: data.productId,
      rating: data.rating,
      comment: data.comment,
      status: "PENDING" // Customer reviews are pending by default
    }
  })

  return { success: true }
}
