import { db } from "@/lib/db"

export type BulkRow = {
  /** "p:<productId>" for products without sizes/colours, "v:<variantId>" for each size/colour. */
  key: string
  productId: string
  name: string
  variantName: string | null
  imageUrl: string | null
  price: number
  costPrice: number | null
  stockCount: number
}

export type BulkUpdate = { key: string; price?: unknown; costPrice?: unknown; stockCount?: unknown }

/** Every price and stock level in the store, one row per thing a customer can buy. */
export async function getBulkRows(storeId: string): Promise<BulkRow[]> {
  const products = await db.product.findMany({
    where: { storeId, status: { not: "ARCHIVED" } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      costPrice: true,
      stockCount: true,
      images: true,
      _count: { select: { options: true } },
      variants: { select: { id: true, name: true, price: true, costPrice: true, stockCount: true }, orderBy: { name: "asc" } },
    },
  })

  return products.flatMap((p): BulkRow[] => {
    const imageUrl = p.images[0] ?? null
    if (p._count.options === 0) {
      const v = p.variants[0]
      return [
        {
          key: `p:${p.id}`,
          productId: p.id,
          name: p.name,
          variantName: null,
          imageUrl,
          price: v?.price ?? p.price ?? 0,
          costPrice: p.costPrice,
          stockCount: v?.stockCount ?? p.stockCount,
        },
      ]
    }
    return p.variants.map((v) => ({
      key: `v:${v.id}`,
      productId: p.id,
      name: p.name,
      variantName: v.name,
      imageUrl,
      price: v.price,
      costPrice: v.costPrice ?? p.costPrice,
      stockCount: v.stockCount,
    }))
  })
}

function money(value: unknown, field: string) {
  if (value === undefined) return { ok: true as const, value: undefined }
  if (value === null || value === "") return field === "price" ? { ok: false as const } : { ok: true as const, value: null }
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return { ok: false as const }
  return { ok: true as const, value: Math.round(n * 100) / 100 }
}

/** Saves many price / cost / stock changes at once. Callers must check store access first. */
export async function applyBulkUpdates(storeId: string, updates: BulkUpdate[]) {
  if (!Array.isArray(updates) || updates.length === 0) return { error: "Nothing to save." }
  if (updates.length > 1000) return { error: "Save at most 1000 rows at a time." }

  let saved = 0
  for (const u of updates) {
    const price = money(u.price, "price")
    const cost = money(u.costPrice, "costPrice")
    const stock = u.stockCount === undefined ? undefined : Math.floor(Number(u.stockCount))
    if (!price.ok) return { error: "Each price must be a number, e.g. 120." }
    if (!cost.ok) return { error: "Cost prices must be numbers (or left empty)." }
    if (stock !== undefined && (!Number.isFinite(stock) || stock < 0 || stock > 1_000_000)) {
      return { error: "Stock must be a whole number, 0 or more." }
    }

    const [kind, id] = String(u.key).split(":")
    if (kind === "p") {
      const product = await db.product.findFirst({
        where: { id, storeId },
        select: { id: true, variants: { select: { id: true, stockCount: true } } },
      })
      if (!product) continue
      await db.product.update({
        where: { id },
        data: {
          ...(price.value != null ? { price: price.value } : {}),
          ...(cost.value !== undefined ? { costPrice: cost.value } : {}),
          ...(stock !== undefined ? { stockCount: stock } : {}),
        },
      })
      for (const v of product.variants) {
        await db.productVariant.update({
          where: { id: v.id },
          data: {
            ...(price.value != null ? { price: price.value } : {}),
            ...(stock !== undefined ? { stockCount: stock } : {}),
          },
        })
        if (stock !== undefined && stock !== v.stockCount) {
          await db.inventoryHistory.create({ data: { variantId: v.id, quantity: stock - v.stockCount, reason: "CORRECTION" } })
        }
      }
      saved += 1
    } else if (kind === "v") {
      const variant = await db.productVariant.findFirst({
        where: { id, product: { storeId } },
        select: { id: true, stockCount: true },
      })
      if (!variant) continue
      await db.productVariant.update({
        where: { id },
        data: {
          ...(price.value != null ? { price: price.value } : {}),
          ...(cost.value !== undefined ? { costPrice: cost.value } : {}),
          ...(stock !== undefined ? { stockCount: stock } : {}),
        },
      })
      if (stock !== undefined && stock !== variant.stockCount) {
        await db.inventoryHistory.create({ data: { variantId: id, quantity: stock - variant.stockCount, reason: "CORRECTION" } })
      }
      saved += 1
    }
  }
  return { success: true as const, saved }
}
