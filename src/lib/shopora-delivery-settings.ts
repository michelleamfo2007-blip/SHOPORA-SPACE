import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { geocodeAddress, isAccraArea } from "@/lib/shopora-delivery"

/** Turn Shopora Delivery on/off and set the Accra pickup point. Callers must check store access + role first. */
export async function updateShoporaDeliverySettings(
  storeId: string,
  input: { enabled: boolean; pickupAddress: string; pickupCity: string }
) {
  const enabled = input.enabled
  const pickupAddress = input.pickupAddress.trim()
  const pickupCity = input.pickupCity.trim() || "Accra"

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
  return { success: true as const }
}
