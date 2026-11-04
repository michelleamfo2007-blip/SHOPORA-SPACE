import { db } from "@/lib/db"

/** Seller-added review (e.g. from WhatsApp feedback). Callers must check store access first. */
export async function addManualReview(
  storeId: string,
  data: { customerName: string; rating: number; comment: string; productId?: string }
) {
  const customerName = data.customerName.trim()
  if (!customerName) return { error: "Add the customer's name." }
  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) return { error: "Choose 1 to 5 stars." }

  let customer = await db.customer.findFirst({ where: { storeId, name: customerName } })
  if (!customer) {
    customer = await db.customer.create({ data: { storeId, name: customerName } })
  }

  let productId = data.productId
  if (productId) {
    const product = await db.product.findFirst({ where: { id: productId, storeId } })
    if (!product) return { error: "Product not found" }
  } else {
    const p = await db.product.findFirst({ where: { storeId } })
    if (!p) return { error: "Store has no products to review." }
    productId = p.id
  }

  await db.review.create({
    data: {
      storeId,
      customerId: customer.id,
      productId,
      rating: data.rating,
      comment: data.comment,
      status: "PUBLISHED",
    },
  })
  return { success: true as const }
}
