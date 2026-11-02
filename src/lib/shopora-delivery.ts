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
  /** Lower Accra pricing — still distance/time based. */
  baseFee: 10,
  perKm: 2,
  perMinute: 0.35,
  minFee: 15,
  maxFee: 60,
  /** Share of delivery fee owed to Shopora (rider remits later). */
  platformCutRate: 0.15,
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

export type PlaceSuggestion = {
  id: string
  label: string
  exactLocation: string
  city: string
  lat?: number
  lng?: number
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

function cityFromNominatimAddress(address?: Record<string, string>) {
  if (!address) return "Accra"
  return (
    address.city ||
    address.town ||
    address.suburb ||
    address.county ||
    address.state ||
    "Accra"
  )
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    osm_id?: number
    osm_type?: string
    name?: string
    street?: string
    housenumber?: string
    district?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country?: string
    countrycode?: string
    type?: string
  }
}

function formatPhotonLabel(p: NonNullable<PhotonFeature["properties"]>) {
  return [
    p.name,
    p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street,
    p.suburb || p.district,
    p.city || p.town || p.village,
    p.state,
    p.country,
  ]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(", ")
}

/** Photon (Komoot) — free OSM autocomplete, better typing suggestions than Nominatim. */
async function searchPhotonPlaces(query: string): Promise<PlaceSuggestion[]> {
  const url = new URL("https://photon.komoot.io/api/")
  url.searchParams.set("q", query)
  url.searchParams.set("lat", "5.6037")
  url.searchParams.set("lon", "-0.1870")
  url.searchParams.set("limit", "8")
  url.searchParams.set("lang", "en")
  // Accra metro bbox: minLon, minLat, maxLon, maxLat
  url.searchParams.set("bbox", "-0.35,5.48,0.05,5.78")

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "ShoporaDelivery/1.0 (shopora.space)" },
    next: { revalidate: 0 },
  })
  if (!res.ok) return []

  const data = (await res.json()) as { features?: PhotonFeature[] }
  const features = data.features || []

  const mapped: PlaceSuggestion[] = []
  for (let index = 0; index < features.length; index++) {
    const f = features[index]
    const p = f.properties || {}
    const coords = f.geometry?.coordinates
    const code = (p.countrycode || "").toUpperCase()
    if (code && code !== "GH") continue

    const cityRaw = p.city || p.town || p.village || p.county || p.state || "Accra"
    const label = formatPhotonLabel(p) || query
    const exact =
      p.name ||
      (p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street) ||
      p.suburb ||
      p.district ||
      label.split(",")[0] ||
      query

    mapped.push({
      id: `photon-${p.osm_type || "n"}-${p.osm_id || index}`,
      label,
      exactLocation: exact,
      city: isAccraArea(cityRaw, label) ? "Accra" : cityRaw,
      ...(coords ? { lat: coords[1], lng: coords[0] } : {}),
    })
  }

  // Prefer Accra-area matches first
  return mapped.sort((a, b) => {
    const aAccra = isAccraArea(a.city, a.label) ? 0 : 1
    const bAccra = isAccraArea(b.city, b.label) ? 0 : 1
    return aAccra - bAccra
  })
}

async function searchNominatimPlaces(query: string): Promise<PlaceSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", `${query}, Accra, Ghana`)
  url.searchParams.set("format", "json")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("limit", "6")
  url.searchParams.set("countrycodes", "gh")
  url.searchParams.set("viewbox", "-0.35,5.78,0.05,5.48")
  url.searchParams.set("bounded", "0")

  const res = await fetch(url, {
    headers: { "User-Agent": "ShoporaDelivery/1.0 (shopora.space)" },
    next: { revalidate: 0 },
  })
  if (!res.ok) return []
  const data = (await res.json()) as Array<{
    place_id: number
    display_name: string
    lat: string
    lon: string
    name?: string
    address?: Record<string, string>
  }>

  return data.map((item) => {
    const city = cityFromNominatimAddress(item.address)
    const exact =
      item.name ||
      [item.address?.road, item.address?.suburb, item.address?.neighbourhood].filter(Boolean).join(", ") ||
      item.display_name.split(",")[0] ||
      query
    return {
      id: `osm-${item.place_id}`,
      label: item.display_name,
      exactLocation: exact,
      city: isAccraArea(city, item.display_name) ? "Accra" : city,
      lat: Number(item.lat),
      lng: Number(item.lon),
    }
  })
}

/** Autocomplete for checkout. Photon first (free), Nominatim fallback. Accra-biased. */
export async function searchDeliveryPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim()
  if (q.length < 2) return []

  try {
    const photon = await searchPhotonPlaces(q)
    if (photon.length > 0) return photon.slice(0, 6)
  } catch (err) {
    console.error("Photon place search failed:", err)
  }

  return searchNominatimPlaces(q)
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
