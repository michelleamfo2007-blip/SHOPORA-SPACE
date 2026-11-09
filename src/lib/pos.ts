import { db } from "@/lib/db"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"
import { WALK_IN_CUSTOMER_NAME, createManualOrder } from "@/lib/manual-order"
import { TILL_PAYMENT_METHODS, type Receipt } from "@/lib/pos-receipt"

/** Everything sellable, with photos and stock, for the till's product grid. */
export async function getTillProducts(storeId: string) {
  const products = await db.product.findMany({
    where: { storeId, status: { not: "ARCHIVED" } },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      images: true,
      sku: true,
      categories: { select: { name: true }, take: 1 },
      variants: { select: { id: true, name: true, price: true, stockCount: true, sku: true, imageUrl: true }, orderBy: { name: "asc" } },
    },
  })
  return products.flatMap((p) =>
    p.variants.map((v) => ({
      variantId: v.id,
      productId: p.id,
      name: p.name,
      variantName: v.name && v.name !== DEFAULT_VARIANT_NAME ? v.name : null,
      price: v.price,
      stockCount: v.stockCount,
      sku: v.sku || p.sku || null,
      category: p.categories[0]?.name ?? null,
      imageUrl: v.imageUrl || p.images[0] || null,
    }))
  )
}

export type TillSaleInput = {
  items: { variantId: string; quantity: number }[]
  paymentMethod: string
  amountTendered?: number | null
  customer?: { name?: string | null; phone?: string | null } | null
}

/**
 * Rings up a walk-in sale. Stock comes off immediately (same rules as online checkout), so the
 * website always shows what's really left on the shelf.
 */
export async function createTillSale(storeId: string, input: TillSaleInput) {
  const method = TILL_PAYMENT_METHODS.find((m) => m.value === input.paymentMethod)?.value
  if (!method) return { error: "Choose how the customer paid." }

  const store = await db.store.findUnique({ where: { id: storeId }, select: { name: true, slug: true, currency: true } })
  if (!store) return { error: "Store not found." }

  const name = input.customer?.name?.trim() || WALK_IN_CUSTOMER_NAME
  const phone = input.customer?.phone?.trim() || null

  const tendered = input.amountTendered == null || input.amountTendered === ("" as unknown) ? null : Number(input.amountTendered)
  if (tendered != null && (!Number.isFinite(tendered) || tendered < 0)) return { error: "Enter the cash received as a number." }

  const result = await createManualOrder(
    storeId,
    {
      items: (input.items ?? []).map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      customer: { name: name.length >= 2 ? name : WALK_IN_CUSTOMER_NAME, phone },
      source: "WALK_IN",
      paid: true,
    },
    { paymentMethod: method, amountTendered: method === "CASH" ? tendered : null }
  )
  if ("error" in result) return { error: result.error }

  const total = result.order.totalAmount

  const receipt: Receipt = {
    storeName: store.name,
    storeUrl: `https://${store.slug}.shopora.space`,
    orderNumber: result.order.orderNumber,
    createdAt: result.order.createdAt.toISOString(),
    currency: store.currency,
    lines: result.lines,
    total,
    paymentMethod: method,
    amountTendered: method === "CASH" ? tendered : null,
    change: method === "CASH" && tendered != null ? Math.max(0, Math.round((tendered - total) * 100) / 100) : null,
  }
  return { success: true as const, orderId: result.order.id, receipt, customerPhone: phone }
}

/** Today's till takings, split by how customers paid. Ghana is on UTC, so "today" is the UTC day. */
export async function getTillSummary(storeId: string, day = new Date()) {
  const from = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()))
  const to = new Date(from.getTime() + 86400000)

  const sales = await db.order.findMany({
    where: { storeId, source: "POS", createdAt: { gte: from, lt: to }, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      tillPaymentMethod: true,
      createdAt: true,
      orderItems: { select: { quantity: true } },
    },
  })

  const byMethod = TILL_PAYMENT_METHODS.map((m) => {
    const list = sales.filter((s) => s.tillPaymentMethod === m.value)
    return { method: m.value, label: m.label, sales: list.length, total: list.reduce((sum, s) => sum + s.totalAmount, 0) }
  })

  return {
    date: from.toISOString().slice(0, 10),
    sales: sales.length,
    total: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    itemsSold: sales.reduce((sum, s) => sum + s.orderItems.reduce((n, i) => n + i.quantity, 0), 0),
    byMethod,
    recent: sales.slice(0, 10).map((s) => ({
      id: s.id,
      orderNumber: s.orderNumber,
      total: s.totalAmount,
      paymentMethod: s.tillPaymentMethod,
      createdAt: s.createdAt,
    })),
  }
}
