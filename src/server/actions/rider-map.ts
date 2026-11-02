"use server"

import { geocodeAddress } from "@/lib/shopora-delivery"

export type MapPoint = { lat: number; lng: number; label: string }

export async function resolveRiderMapPointsAction(input: {
  pickupAddress: string
  dropoffAddress: string
}): Promise<{ pickup: MapPoint | null; dropoff: MapPoint | null }> {
  const [pickup, dropoff] = await Promise.all([
    geocodeAddress({ exactLocation: input.pickupAddress, city: "Accra", country: "Ghana" }),
    geocodeAddress({ exactLocation: input.dropoffAddress, city: "Accra", country: "Ghana" }),
  ])

  return {
    pickup: pickup ? { ...pickup, label: "Pickup" } : null,
    dropoff: dropoff ? { ...dropoff, label: "Customer" } : null,
  }
}
