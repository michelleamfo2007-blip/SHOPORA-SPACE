"use server"

import { geocodeAddress } from "@/lib/shopora-delivery"

export type MapPoint = { lat: number; lng: number; label: string }

export async function resolveRiderMapPointsAction(input: {
  pickupAddress: string
  dropoffAddress: string
  /** Exact pin the customer dropped at checkout; preferred over geocoding the address text. */
  dropoffLat?: number | null
  dropoffLng?: number | null
}): Promise<{ pickup: MapPoint | null; dropoff: MapPoint | null }> {
  const exact =
    typeof input.dropoffLat === "number" && typeof input.dropoffLng === "number"
      ? { lat: input.dropoffLat, lng: input.dropoffLng }
      : null

  const [pickup, dropoff] = await Promise.all([
    geocodeAddress({ exactLocation: input.pickupAddress, city: "Accra", country: "Ghana" }),
    exact ?? geocodeAddress({ exactLocation: input.dropoffAddress, city: "Accra", country: "Ghana" }),
  ])

  return {
    pickup: pickup ? { ...pickup, label: "Pickup" } : null,
    dropoff: dropoff ? { ...dropoff, label: "Customer" } : null,
  }
}
