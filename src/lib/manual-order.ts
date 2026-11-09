import { db } from "@/lib/db"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"

/** Channels a seller can record an order from (website orders come through checkout). */
export const MANUAL_ORDER_SOURCES = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WALK_IN", label: "Walk-in" },
  { value: "PHONE", label: "Phone call" },
  { value: "OTHER", label: "Other" },
] as const

export type ManualOrderSource = (typeof MANUAL_ORDER_SOURCES)[number]["value"]

export const ORDER_SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  POS: "Shop till",
  ...Object.fromEntries(MANUAL_ORDER_SOURCES.map((s) => [s.value, s.label])),
}

/** Name used for till sales where the seller doesn't take the customer's details. */
export const WALK_IN_CUSTOMER_NAME = "Walk-in customer"

/** How a till sale was paid. Only set by the POS, never by the manual-order form. */
type TillSale = { paymentMethod: string; amountTendered: number | null }

export type ManualOrderInput = {
  items: { variantId: string; quantity: number; price?: number | null }[]
  customer: { name: string; phone?: string | null; email?: string | null }
  source: string
  paid: boolean
  deliveryAddress?: string | null
  deliveryFee?: number | null
  notes?: string | null
}

class OutOfStockError extends Error {
  constructor(public itemName: string) {
    super("OUT_OF_STOCK")
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Products and variants a seller can pick when recording an order. */
export async function listSellableVariants(storeId: string) {
  const products = await db.product.findMany({
    where: { storeId, status: { not: "ARCHIVED" } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      images: true,
      variants: { select: { id: true, name: true, price: true, stockCount: true }, orderBy: { name: "asc" } },
    },
  })
  return products.flatMap((p) =>
    p.variants.map((v) => ({
      variantId: v.id,
      productId: p.id,
      name: v.name && v.name !== DEFAULT_VARIANT_NAME ? `${p.name} (${v.name})` : p.name,
      price: v.price,
      stockCount: v.stockCount,
      imageUrl: p.images[0] ?? null,
    }))
  )
}

/**
 * Records a sale made outside the website (WhatsApp, Instagram, walk-in…). Stock is taken
 * the same way checkout does, so the website never oversells what was sold in person.
 */
export async function createManualOrder(storeId: string, input: ManualOrderInput, till?: TillSale) {
  const name = input.customer.name?.trim() ?? ""
  if (name.length < 2) return { error: "Enter the customer's name." }
  const phone = input.customer.phone?.trim() || null
  if (phone && (phone.replace(/\D/g, "").length < 9 || phone.replace(/\D/g, "").length > 15)) {
    return { error: "Enter a valid phone number, e.g. 024 123 4567." }
  }
  const email = input.customer.email?.trim().toLowerCase() || null
  if (email && !EMAIL_RE.test(email)) return { error: "Enter a valid email address or leave it empty." }

  const source = till
    ? "POS"
    : ((MANUAL_ORDER_SOURCES.find((s) => s.value === input.source)?.value ?? "OTHER") as ManualOrderSource)
  const deliveryFee = Math.max(0, Number(input.deliveryFee) || 0)
  const notes = input.notes?.trim().slice(0, 500) || null
  const address = input.deliveryAddress?.trim().slice(0, 300) || null

  const wanted = new Map<string, { quantity: number; price: number | null }>()
  for (const item of input.items ?? []) {
    const quantity = Math.floor(Number(item.quantity))
    if (!item.variantId || !Number.isFinite(quantity) || quantity < 1 || quantity > 1000) {
      return { error: "Check the quantities — each must be between 1 and 1000." }
    }
    const price = item.price == null || item.price === ("" as unknown) ? null : Number(item.price)
    if (price != null && (!Number.isFinite(price) || price < 0)) return { error: "Prices can't be negative." }
    const existing = wanted.get(item.variantId)
    wanted.set(item.variantId, { quantity: (existing?.quantity ?? 0) + quantity, price: price ?? existing?.price ?? null })
  }
  if (wanted.size === 0) return { error: "Add at least one product." }

  const variants = await db.productVariant.findMany({
    where: { id: { in: [...wanted.keys()] }, product: { storeId } },
    select: {
      id: true,
      name: true,
      price: true,
      costPrice: true,
      stockCount: true,
      productId: true,
      product: { select: { name: true, costPrice: true, _count: { select: { options: true } } } },
    },
  })
  if (variants.length !== wanted.size) return { error: "Some products are no longer available. Refresh and try again." }

  const lines = variants.map((v) => {
    const w = wanted.get(v.id)!
    return {
      variantId: v.id,
      productId: v.productId,
      simple: v.product._count.options === 0,
      name: v.name && v.name !== DEFAULT_VARIANT_NAME ? `${v.product.name} (${v.name})` : v.product.name,
      quantity: w.quantity,
      price: w.price ?? v.price,
      costPrice: v.costPrice ?? v.product.costPrice ?? null,
      stock: v.stockCount,
    }
  })
  for (const line of lines) {
    if (line.quantity > line.stock) {
      return { error: line.stock <= 0 ? `${line.name} is out of stock.` : `Only ${line.stock} of ${line.name} left.` }
    }
  }

  const totalAmount = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  let customer = phone || email
    ? await db.customer.findFirst({
        where: {
          storeId,
          OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
        },
      })
    : name === WALK_IN_CUSTOMER_NAME
      ? await db.customer.findFirst({ where: { storeId, name: WALK_IN_CUSTOMER_NAME, phone: null, email: null } })
      : null
  if (!customer) {
    customer = await db.customer.create({ data: { storeId, name, phone, email } })
  } else if (!customer.phone && phone) {
    customer = await db.customer.update({ where: { id: customer.id }, data: { phone } })
  }
  const customerId = customer.id

  try {
    const order = await db.$transaction(async (tx) => {
      for (const line of lines) {
        const taken = await tx.productVariant.updateMany({
          where: { id: line.variantId, stockCount: { gte: line.quantity } },
          data: { stockCount: { decrement: line.quantity } },
        })
        if (taken.count === 0) throw new OutOfStockError(line.name)
        if (line.simple) {
          await tx.product.update({ where: { id: line.productId }, data: { stockCount: { decrement: line.quantity } } })
        }
      }

      return tx.order.create({
        data: {
          storeId,
          customerId,
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
          totalAmount,
          shippingAmount: deliveryFee,
          status: till ? "DELIVERED" : input.paid ? "PROCESSING" : "PENDING",
          shippingAddress: address,
          deliveryMethod: "VENDOR",
          stockReserved: true,
          source,
          notes,
          tillPaymentMethod: till?.paymentMethod ?? null,
          amountTendered: till?.amountTendered ?? null,
          orderItems: {
            create: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity, price: l.price, costPrice: l.costPrice })),
          },
          payments: {
            create: {
              provider: "MANUAL_TRANSFER",
              status: input.paid || till ? "COMPLETED" : "PENDING",
              amount: totalAmount,
              reference: till ? `Shop till · ${till.paymentMethod}` : `Recorded by seller · ${ORDER_SOURCE_LABELS[source]}`,
            },
          },
        },
        select: { id: true, orderNumber: true, totalAmount: true, createdAt: true },
      })
    })
    return {
      success: true as const,
      order,
      lines: lines.map((l) => ({ name: l.name, quantity: l.quantity, price: l.price })),
    }
  } catch (err) {
    if (err instanceof OutOfStockError) return { error: `${err.itemName} just ran out. Update the quantity and try again.` }
    console.error("Failed to record manual order", err)
    return { error: "Could not save the order. Try again." }
  }
}
