import { db } from "@/lib/db"

export const DEFAULT_VARIANT_NAME = "Default"

export type VariantInput = {
  name: string
  price: number
  compareAtPrice: number | null
  sku: string
  stockCount: number
  imageUrl: string | null
  optionValueIds: string[]
}

type ProductForVariants = {
  name: string
  price?: number | null
  compareAtPrice?: number | null
  sku?: string | null
  stockCount?: number | null
  options: { values: { id: string; value: string }[] }[]
}

type IncomingVariant = {
  name: string
  price: number
  compareAtPrice?: number | string | null
  sku?: string
  stockCount: number
  imageBase64?: string
}

function generateSku(productName: string) {
  return `${productName.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

/** Turns the product form payload into variant rows. Simple products get one "Default" variant so checkout always has a variant to reference. */
export function buildVariantInputs(product: ProductForVariants, incoming: IncomingVariant[] | undefined): VariantInput[] {
  if (!incoming || incoming.length === 0) {
    return [{
      name: DEFAULT_VARIANT_NAME,
      price: product.price ?? 0,
      compareAtPrice: product.compareAtPrice ?? null,
      sku: product.sku || generateSku(product.name),
      stockCount: product.stockCount ?? 0,
      imageUrl: null,
      optionValueIds: [],
    }]
  }

  return incoming.map((v) => {
    const valueNames = v.name.split(" / ")
    const optionValueIds = product.options
      .map((option, index) => option.values.find((ov) => ov.value === valueNames[index])?.id)
      .filter((id): id is string => !!id)

    return {
      name: v.name,
      price: v.price,
      compareAtPrice: v.compareAtPrice ? parseFloat(String(v.compareAtPrice)) : null,
      sku: v.sku || generateSku(product.name),
      stockCount: v.stockCount,
      imageUrl: v.imageBase64 || null,
      optionValueIds,
    }
  })
}

/** Updates variants in place by name. Variants that already have orders are never deleted, since order items reference them. */
export async function syncProductVariants(productId: string, wanted: VariantInput[]) {
  const existing = await db.productVariant.findMany({
    where: { productId },
    select: { id: true, name: true, _count: { select: { orderItems: true } } },
  })

  const keptIds = new Set<string>()
  for (const { optionValueIds, ...fields } of wanted) {
    const match = existing.find((e) => e.name === fields.name && !keptIds.has(e.id))
    if (match) {
      await db.productVariant.update({
        where: { id: match.id },
        data: { ...fields, optionValues: { set: optionValueIds.map((id) => ({ id })) } },
      })
      keptIds.add(match.id)
    } else {
      const created = await db.productVariant.create({
        data: { ...fields, productId, optionValues: { connect: optionValueIds.map((id) => ({ id })) } },
      })
      keptIds.add(created.id)
    }
  }

  const removable = existing.filter((e) => !keptIds.has(e.id) && e._count.orderItems === 0).map((e) => e.id)
  if (removable.length > 0) {
    await db.productVariant.deleteMany({ where: { id: { in: removable } } })
  }
}
