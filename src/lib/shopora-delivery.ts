/**
 * Shopora Delivery — Accra v1 live rates.
 *
 * Customer pays product total to the vendor.
 * Customer pays this delivery fee to the rider on arrival.
 * Rider later settles Shopora's cut (tracked in rider wallet).
 */

export const SHOPORA_DELIVERY_CONFIG = {
  city: "Accra",
  currency: "GHS",
  baseFee: 15,
  perKm: 3,
  perMinute: 0.5,
  minFee: 20,
  maxFee: 80,
  /** Share of delivery fee owed to Shopora (rider remits later). */
  platformCutRate: 0.2,
  /** Rough Accra metro bounding box for v1. */
  bounds: {
    minLat: 5.48,
    maxLat: 5.78,
    minLng: -0.35,
    maxLng: 0.05,
  },
} as const

export type LatLng = { lat: number; lng: number }

export type DeliveryQuote = {
  fee: number
  distanceKm: number
  durationMin: number
  shoporaCut: number
  riderPayout: number
  currency: string
  source: "google" | "osrm"
  pickup: LatLng
  dropoff: LatLng
}

const ACCRA_CITY_HINTS = [
  "accra",
  "tema",
  "madina",
  "east legon",
  "spintex",
  "osu",
  "labone",
  "cantonments",
  "airport",
  "kaneshie",
  "dansoman",
  "ablekuma",
  "adenta",
  "haatso",
  "legon",
  "achimota",
  "nima",
  "circle",
  "kasoa",
]

export function isAccraArea(city: string | null | undefined, address = ""): boolean {
  const text = `${city ?? ""} ${address}`.toLowerCase()
  return ACCRA_CITY_HINTS.some((hint) => text.includes(hint))
}

export function inAccraBounds({ lat, lng }: LatLng): boolean {
  const { minLat, maxLat, minLng, maxLng } = SHOPORA_DELIVERY_CONFIG.bounds
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

export function calculateDeliveryFee(distanceKm: number, durationMin: number): {
  fee: number
  shoporaCut: number
  riderPayout: number
} {
  const { baseFee, perKm, perMinute, minFee, maxFee, platformCutRate } = SHOPORA_DELIVERY_CONFIG
  const raw = baseFee + distanceKm * perKm + durationMin * perMinute
  const fee = Math.round(Math.min(maxFee, Math.max(minFee, raw)))
  const shoporaCut = Math.round(fee * platformCutRate * 100) / 100
  const riderPayout = Math.round((fee - shoporaCut) * 100) / 100
  return { fee, shoporaCut, riderPayout }
}

async function geocodeNominatim(query: string): Promise<LatLng | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", query)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "1")
  url.searchParams.set("countrycodes", "gh")

  const res = await fetch(url, {
    headers: { "User-Agent": "ShoporaDelivery/1.0 (shopora.space)" },
    next: { revalidate: 0 },
  })
  if (!res.ok) return null
  const data = (await res.json()) as Array<{ lat: string; lon: string }>
  if (!data[0]) return null
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) }
}

async function geocodeGoogle(query: string, apiKey: string): Promise<LatLng | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
  url.searchParams.set("address", query)
  url.searchParams.set("components", "country:GH")
  url.searchParams.set("key", apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) return null
  const data = (await res.json()) as {
    status: string
    results: Array<{ geometry: { location: { lat: number; lng: number } } }>
  }
  if (data.status !== "OK" || !data.results[0]) return null
  return data.results[0].geometry.location
}

async function routeGoogle(
  pickup: LatLng,
  dropoff: LatLng,
  apiKey: string
): Promise<{ distanceKm: number; durationMin: number } | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json")
  url.searchParams.set("origins", `${pickup.lat},${pickup.lng}`)
  url.searchParams.set("destinations", `${dropoff.lat},${dropoff.lng}`)
  url.searchParams.set("mode", "driving")
  url.searchParams.set("departure_time", "now")
  url.searchParams.set("key", apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) return null
  const data = (await res.json()) as {
    rows: Array<{
      elements: Array<{
        status: string
        distance?: { value: number }
        duration_in_traffic?: { value: number }
        duration?: { value: number }
      }>
    }>
  }
  const el = data.rows?.[0]?.elements?.[0]
  if (!el || el.status !== "OK" || !el.distance) return null
  const seconds = el.duration_in_traffic?.value ?? el.duration?.value ?? 0
  return {
    distanceKm: el.distance.value / 1000,
    durationMin: seconds / 60,
  }
}

async function routeOsrm(
  pickup: LatLng,
  dropoff: LatLng
): Promise<{ distanceKm: number; durationMin: number } | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=false`
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return null
  const data = (await res.json()) as {
    code: string
    routes: Array<{ distance: number; duration: number }>
  }
  if (data.code !== "Ok" || !data.routes[0]) return null
  return {
    distanceKm: data.routes[0].distance / 1000,
    durationMin: data.routes[0].duration / 60,
  }
}

export async function geocodeAddress(parts: {
  exactLocation: string
  city: string
  country?: string
}): Promise<LatLng | null> {
  const query = [parts.exactLocation, parts.city, parts.country || "Ghana"].filter(Boolean).join(", ")
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (apiKey) {
    const g = await geocodeGoogle(query, apiKey)
    if (g) return g
  }
  return geocodeNominatim(query)
}

export async function quoteShoporaDelivery(input: {
  pickup: LatLng
  dropoffAddress: { exactLocation: string; city: string; country?: string }
}): Promise<{ ok: true; quote: DeliveryQuote } | { ok: false; error: string }> {
  if (!inAccraBounds(input.pickup)) {
    return { ok: false, error: "Shopora Delivery is only available for Accra pickups right now." }
  }

  const dropoff = await geocodeAddress(input.dropoffAddress)
  if (!dropoff) {
    return { ok: false, error: "We could not find that delivery address. Try a clearer landmark or area." }
  }
  if (!inAccraBounds(dropoff)) {
    return { ok: false, error: "Shopora Delivery is only available inside Accra for now." }
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  let route: { distanceKm: number; durationMin: number } | null = null
  let source: DeliveryQuote["source"] = "osrm"

  if (apiKey) {
    route = await routeGoogle(input.pickup, dropoff, apiKey)
    if (route) source = "google"
  }
  if (!route) {
    route = await routeOsrm(input.pickup, dropoff)
    source = "osrm"
  }
  if (!route) {
    return { ok: false, error: "We could not calculate a live delivery rate right now. Please try again." }
  }

  const { fee, shoporaCut, riderPayout } = calculateDeliveryFee(route.distanceKm, route.durationMin)

  return {
    ok: true,
    quote: {
      fee,
      distanceKm: Math.round(route.distanceKm * 10) / 10,
      durationMin: Math.round(route.durationMin),
      shoporaCut,
      riderPayout,
      currency: SHOPORA_DELIVERY_CONFIG.currency,
      source,
      pickup: input.pickup,
      dropoff,
    },
  }
}
