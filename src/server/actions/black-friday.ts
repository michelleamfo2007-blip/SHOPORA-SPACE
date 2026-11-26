"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getStoreAccess } from "@/lib/store-access"
import { parseSalePrice } from "@/lib/black-friday"

export async function setBlackFridayOnAction(storeId: string, on: boolean) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { blackFridayAccess: true },
  })
  if (!store?.blackFridayAccess) {
    return { error: "Shopora has not opened Black Friday for this store yet." }
  }

  await db.store.update({
    where: { id: storeId },
    data: { blackFridayOn: on },
  })

  revalidatePath(`/${storeId}/black-friday`)
  revalidatePath(`/${storeId}/products`)
  revalidatePath("/", "layout")
  return { success: true as const }
}

export type BlackFridayPriceUpdate = { key: string; blackFridayPrice: unknown }

export async function saveBlackFridayPricesAction(storeId: string, updates: BlackFridayPriceUpdate[]) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { blackFridayAccess: true },
  })
  if (!store?.blackFridayAccess) {
    return { error: "Shopora has not opened Black Friday for this store yet." }
  }

  if (!Array.isArray(updates) || updates.length === 0) return { error: "Nothing to save." }
  if (updates.length > 1000) return { error: "Save at most 1000 rows at a time." }

  let saved = 0
  for (const u of updates) {
    const parsed = parseSalePrice(u.blackFridayPrice)
    if (!parsed.ok) return { error: "Enter a valid sale price, or leave it blank." }

    if (typeof u.key !== "string") continue

    if (u.key.startsWith("p:")) {
      const productId = u.key.slice(2)
      const product = await db.product.findFirst({
        where: { id: productId, storeId },
        select: { id: true, price: true, variants: { select: { id: true, price: true }, take: 1 } },
      })
      if (!product) continue
      const regular = product.variants[0]?.price ?? product.price ?? 0
      if (parsed.value != null && parsed.value >= regular) {
        return { error: "Sale price must be lower than the regular price." }
      }
      await db.product.update({
        where: { id: product.id },
        data: { blackFridayPrice: parsed.value },
      })
      const defaultVariant = product.variants[0]
      if (defaultVariant) {
        await db.productVariant.update({
          where: { id: defaultVariant.id },
          data: { blackFridayPrice: parsed.value },
        })
      }
      saved += 1
    } else if (u.key.startsWith("v:")) {
      const variantId = u.key.slice(2)
      const variant = await db.productVariant.findFirst({
        where: { id: variantId, product: { storeId } },
        select: { id: true, price: true },
      })
      if (!variant) continue
      if (parsed.value != null && parsed.value >= variant.price) {
        return { error: "Sale price must be lower than the regular price." }
      }
      await db.productVariant.update({
        where: { id: variant.id },
        data: { blackFridayPrice: parsed.value },
      })
      saved += 1
    }
  }

  revalidatePath(`/${storeId}/black-friday`)
  revalidatePath("/", "layout")
  return { saved }
}
