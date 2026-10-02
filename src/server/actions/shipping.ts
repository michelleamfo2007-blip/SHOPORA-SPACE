"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireStoreAccess } from "@/lib/store-access"

export async function createShippingZoneAction(storeId: string, formData: FormData) {
  await requireStoreAccess(storeId)

  const name = formData.get("name") as string
  if (!name) throw new Error("Name is required")

  await db.shippingZone.create({
    data: {
      storeId,
      name,
      countries: [] // For MVP, we just use named zones (e.g. "Domestic")
    }
  })

  revalidatePath(`/${storeId}/shipping`)
}

export async function createShippingRateAction(storeId: string, zoneId: string, formData: FormData) {
  await requireStoreAccess(storeId)

  const name = formData.get("name") as string
  const price = parseFloat(formData.get("price") as string)
  const estimatedDays = formData.get("estimatedDays") as string

  if (!name || isNaN(price)) throw new Error("Missing required fields")

  const zone = await db.shippingZone.findFirst({ where: { id: zoneId, storeId } })
  if (!zone) throw new Error("Delivery zone not found")

  await db.shippingRate.create({
    data: {
      zoneId,
      name,
      price,
      estimatedDays
    }
  })

  revalidatePath(`/${storeId}/shipping`)
}

export async function deleteShippingZoneAction(storeId: string, zoneId: string) {
  await requireStoreAccess(storeId)

  await db.shippingZone.deleteMany({
    where: { id: zoneId, storeId } // Relies on Cascade delete to remove rates
  })

  revalidatePath(`/${storeId}/shipping`)
}

export async function deleteShippingRateAction(storeId: string, rateId: string) {
  await requireStoreAccess(storeId)

  await db.shippingRate.deleteMany({
    where: { id: rateId, zone: { storeId } }
  })

  revalidatePath(`/${storeId}/shipping`)
}
