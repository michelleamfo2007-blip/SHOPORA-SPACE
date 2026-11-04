"use client"

import { useEffect, useRef, useState } from "react"
import { LocateFixed, MapPin } from "lucide-react"
import { reverseGeocodeAction } from "@/server/actions/shopora-delivery"

export type Pin = { lat: number; lng: number }
type Place = { exactLocation: string; city: string; label: string }

const ACCRA: Pin = { lat: 5.6037, lng: -0.187 }

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
}

/**
 * Lets the customer drop an exact delivery pin: GPS ("use my location") or by moving the map
 * under a fixed centre pin. The pin is sent with the order so the rider navigates to the exact spot.
 */
export function LocationPicker({
  pin,
  onPinChange,
  onPlaceFound,
}: {
  pin: Pin | null
  onPinChange: (pin: Pin | null) => void
  onPlaceFound: (place: Place) => void
}) {
  const [mapOpen, setMapOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [nearby, setNearby] = useState<string | null>(null)

  async function describe(point: Pin) {
    const { place } = await reverseGeocodeAction(point.lat, point.lng)
    if (place) {
      setNearby(place.label)
      onPlaceFound(place)
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setMessage("Your browser can’t share location. Pick the spot on the map instead.")
      setMapOpen(true)
      return
    }
    setLocating(true)
    setMessage(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        onPinChange(point)
        setLocating(false)
        setMapOpen(true)
        const accuracy = Math.round(pos.coords.accuracy)
        setMessage(
          accuracy > 100
            ? `Location found (about ${accuracy} m accurate). Drag the map to put the pin exactly on your door.`
            : "Location found. Drag the map if the pin isn’t exactly on your door."
        )
        await describe(point)
      },
      (err) => {
        setLocating(false)
        setMapOpen(true)
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Move the map to put the pin on your location instead."
            : "We couldn’t get your location. Move the map to put the pin on your location instead."
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    )
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <LocateFixed className="h-4 w-4" strokeWidth={1.75} />
          {locating ? "Finding you…" : "Use my current location"}
        </button>
        <button
          type="button"
          onClick={() => setMapOpen((v) => !v)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-stone-900 px-5 text-sm text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
        >
          <MapPin className="h-4 w-4" strokeWidth={1.75} />
          {mapOpen ? "Hide map" : pin ? "Adjust pin on map" : "Pick on map"}
        </button>
      </div>

      {message && <p className="text-xs text-stone-600">{message}</p>}

      {mapOpen && (
        <PinMap
          initial={pin ?? ACCRA}
          zoom={pin ? 17 : 12}
          onConfirm={async (point) => {
            onPinChange(point)
            setMessage("Pin saved. Your rider will navigate to this exact spot.")
            setMapOpen(false)
            await describe(point)
          }}
        />
      )}

      {pin && !mapOpen && (
        <div className="flex items-start justify-between gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span>
            <span className="font-medium">Exact pin saved.</span>
            {nearby && <span className="mt-0.5 block text-xs text-emerald-800">Near {nearby}</span>}
          </span>
          <button
            type="button"
            onClick={() => {
              onPinChange(null)
              setNearby(null)
              setMessage(null)
            }}
            className="shrink-0 text-xs underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

function PinMap({ initial, zoom, onConfirm }: { initial: Pin; zoom: number; onConfirm: (pin: Pin) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("maplibre-gl").Map | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const maplibregl = (await import("maplibre-gl")) as typeof import("maplibre-gl")
        await import("maplibre-gl/dist/maplibre-gl.css")
        if (cancelled || !containerRef.current) return
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: OSM_STYLE as never,
          center: [initial.lng, initial.lat],
          zoom,
          attributionControl: { compact: true },
        })
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
        mapRef.current = map
        map.on("load", () => !cancelled && setReady(true))
      } catch (err) {
        console.error(err)
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
    // Map is created once per open; later pin changes come from the map itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (failed) {
    return <p className="text-sm text-red-700">The map couldn’t load. Type your address and landmark instead.</p>
  }

  return (
    <div className="grid gap-3">
      <div className="relative h-72 w-full overflow-hidden border border-stone-300 bg-[#efebe4]">
        <div ref={containerRef} className="absolute inset-0" />
        {/* Fixed centre pin: the customer moves the map under it. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin className="h-9 w-9 fill-[var(--store-accent)] text-white drop-shadow" strokeWidth={1.5} />
        </div>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500">Loading map…</div>
        )}
      </div>
      <p className="text-xs text-stone-500">Drag the map so the pin sits on your gate or door, then confirm.</p>
      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          const c = mapRef.current?.getCenter()
          if (c) onConfirm({ lat: c.lat, lng: c.lng })
        }}
        className="h-11 rounded-full bg-[var(--store-accent)] text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Confirm this spot
      </button>
    </div>
  )
}
