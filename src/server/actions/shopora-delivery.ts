"use server"

import { db } from "@/lib/db"
import { requireStoreAccess } from "@/lib/store-access"
import {
  geocodeAddress,
  isAccraArea,
  quoteShoporaDelivery,
  searchDeliveryPlaces,
  type DeliveryQuote,
  type PlaceSuggestion,
} from "@/lib/shopora-delivery"
import { revalidatePath } from "next/cache"

export async function searchDeliveryPlacesAction(query: string): Promise<{
  suggestions: PlaceSuggestion[]
}> {
  try {
    const suggestions = await searchDeliveryPlaces(query)
    return { suggestions }
  } catch (err) {
    console.error("searchDeliveryPlacesAction", err)
    return { suggestions: [] }
  }
}

export async function updateShoporaDeliverySettingsAction(storeId: string, formData: FormData) {
  const { member } = await requireStoreAccess(storeId)
  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    return { error: "You do not have permission to change delivery settings." }
  }

  const enabled = formData.get("shoporaDeliveryEnabled") === "on" || formData.get("shoporaDeliveryEnabled") === "true"
  const pickupAddress = String(formData.get("pickupAddress") || "").trim()
  const pickupCity = String(formData.get("pickupCity") || "").trim() || "Accra"

  if (enabled) {
    if (!pickupAddress) return { error: "Add your Accra pickup address so we can quote live delivery rates." }
    if (!isAccraArea(pickupCity, pickupAddress)) {
      return { error: "Shopora Delivery is Accra-only for now. Set your pickup city/area to Accra." }
    }
  }

  let pickupLat: number | null = null
  let pickupLng: number | null = null

  if (enabled && pickupAddress) {
    const coords = await geocodeAddress({ exactLocation: pickupAddress, city: pickupCity, country: "Ghana" })
    if (!coords) {
      return { error: "We could not find that pickup address. Add a clearer Accra landmark or street." }
    }
    pickupLat = coords.lat
    pickupLng = coords.lng
  }

  await db.store.update({
    where: { id: storeId },
    data: {
      shoporaDeliveryEnabled: enabled,
      pickupAddress: pickupAddress || null,
      pickupCity: pickupCity || null,
      pickupLat,
      pickupLng,
    },
  })

  revalidatePath(`/${storeId}/shipping`)
  return { success: true }
}

export async function quoteShoporaDeliveryAction(input: {
  storeId: string
  exactLocation: string
  city: string
  country?: string
}): Promise<{ quote: DeliveryQuote } | { error: string }> {
  const store = await db.store.findUnique({
    where: { id: input.storeId },
    select: {
      shoporaDeliveryEnabled: true,
      pickupAddress: true,
      pickupCity: true,
      pickupLat: true,
      pickupLng: true,
    },
  })

  if (!store?.shoporaDeliveryEnabled) {
    return { error: "This store has not turned on Shopora Delivery." }
  }
  if (store.pickupLat == null || store.pickupLng == null) {
    return { error: "This store has not set a pickup location yet." }
  }
  if (!input.exactLocation.trim() || !input.city.trim()) {
    return { error: "Enter your delivery location and city first." }
  }
  if (!isAccraArea(input.city, input.exactLocation)) {
    return { error: "Shopora Delivery is only available for Accra addresses right now." }
  }

  const result = await quoteShoporaDelivery({
    pickup: { lat: store.pickupLat, lng: store.pickupLng },
    dropoffAddress: {
      exactLocation: input.exactLocation.trim(),
      city: input.city.trim(),
      country: input.country || "Ghana",
    },
  })

  if (!result.ok) return { error: result.error }
  return { quote: result.quote }
}
