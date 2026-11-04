"use server"

import { db } from "@/lib/db"
import { requireStoreAccess } from "@/lib/store-access"
import {
  isAccraArea,
  quoteShoporaDelivery,
  reverseGeocode,
  searchDeliveryPlaces,
  type DeliveryQuote,
  type PlaceSuggestion,
} from "@/lib/shopora-delivery"
import { updateShoporaDeliverySettings } from "@/lib/shopora-delivery-settings"

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

  return updateShoporaDeliverySettings(storeId, {
    enabled: formData.get("shoporaDeliveryEnabled") === "on" || formData.get("shoporaDeliveryEnabled") === "true",
    pickupAddress: String(formData.get("pickupAddress") || ""),
    pickupCity: String(formData.get("pickupCity") || ""),
  })
}

/** Fills the address box from a GPS/map pin at checkout. */
export async function reverseGeocodeAction(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { place: null }
  }
  try {
    return { place: await reverseGeocode({ lat, lng }) }
  } catch (err) {
    console.error("reverseGeocodeAction", err)
    return { place: null }
  }
}

export async function quoteShoporaDeliveryAction(input: {
  storeId: string
  exactLocation: string
  city: string
  country?: string
  dropoffLat?: number | null
  dropoffLng?: number | null
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
  const pin =
    typeof input.dropoffLat === "number" && typeof input.dropoffLng === "number" &&
    Number.isFinite(input.dropoffLat) && Number.isFinite(input.dropoffLng)
      ? { lat: input.dropoffLat, lng: input.dropoffLng }
      : null
  if (!pin && !isAccraArea(input.city, input.exactLocation)) {
    return { error: "Shopora Delivery is only available for Accra addresses right now." }
  }

  const result = await quoteShoporaDelivery({
    pickup: { lat: store.pickupLat, lng: store.pickupLng },
    dropoffAddress: {
      exactLocation: input.exactLocation.trim(),
      city: input.city.trim(),
      country: input.country || "Ghana",
    },
    dropoffPoint: pin,
  })

  if (!result.ok) return { error: result.error }
  return { quote: result.quote }
}
