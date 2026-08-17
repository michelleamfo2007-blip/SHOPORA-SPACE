"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createShippingZoneAction(storeId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const price = parseFloat(formData.get("price") as string)
  const estimatedDays = formData.get("estimatedDays") as string

  if (!name || isNaN(price)) throw new Error("Missing required fields")

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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.shippingZone.delete({
    where: { id: zoneId } // Relies on Cascade delete to remove rates
  })

  revalidatePath(`/${storeId}/shipping`)
}

export async function deleteShippingRateAction(storeId: string, rateId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.shippingRate.delete({
    where: { id: rateId }
  })

  revalidatePath(`/${storeId}/shipping`)
}
