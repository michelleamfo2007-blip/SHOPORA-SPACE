"use client"

import { useEffect, useRef, useState } from "react"
import { resolveRiderMapPointsAction } from "@/server/actions/rider-map"

type Props = {
  pickupAddress: string
  dropoffAddress: string
  dropoffLat?: number | null
  dropoffLng?: number | null
  focus?: "pickup" | "dropoff" | "both"
}

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

function markerEl(label: string, color: string) {
  const el = document.createElement("div")
  el.style.cssText = `
    display:flex;flex-direction:column;align-items:center;transform:translateY(-4px);
  `
  el.innerHTML = `
    <span style="background:${color};color:#fff;font:600 11px/1 system-ui,sans-serif;padding:6px 8px;border-radius:999px;white-space:nowrap;">
      ${label}
    </span>
    <span style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};"></span>
  `
  return el
}

export function RiderJobMap({ pickupAddress, dropoffAddress, dropoffLat, dropoffLng, focus = "both" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let map: import("maplibre-gl").Map | null = null
    const markers: import("maplibre-gl").Marker[] = []

    async function boot() {
      setLoading(true)
      setError(null)
      try {
        const [maplibreMod, points] = await Promise.all([
          import("maplibre-gl"),
          resolveRiderMapPointsAction({ pickupAddress, dropoffAddress, dropoffLat, dropoffLng }),
        ])
        await import("maplibre-gl/dist/maplibre-gl.css")
        const maplibregl = maplibreMod as typeof import("maplibre-gl")

        if (cancelled || !containerRef.current) return

        const pickup = points.pickup
        const dropoff = points.dropoff
        if (!pickup && !dropoff) {
          setError("Map pins unavailable for these addresses — use Navigate instead.")
          setLoading(false)
          return
        }

        const center = pickup || dropoff || { lat: 5.6037, lng: -0.187 }
        const nextMap = new maplibregl.Map({
          container: containerRef.current,
          style: OSM_STYLE as any,
          center: [center.lng, center.lat],
          zoom: 12,
          attributionControl: { compact: true },
        })
        map = nextMap
        nextMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")

        const bounds = new maplibregl.LngLatBounds()

        if (pickup && (focus === "both" || focus === "pickup")) {
          const m = new maplibregl.Marker({ element: markerEl("Pickup", "#1c1917") })
            .setLngLat([pickup.lng, pickup.lat])
            .addTo(nextMap)
          markers.push(m)
          bounds.extend([pickup.lng, pickup.lat])
        }
        if (dropoff && (focus === "both" || focus === "dropoff")) {
          const m = new maplibregl.Marker({ element: markerEl("Customer", "#b45309") })
            .setLngLat([dropoff.lng, dropoff.lat])
            .addTo(nextMap)
          markers.push(m)
          bounds.extend([dropoff.lng, dropoff.lat])
        }
        if (focus === "both") {
          if (pickup) bounds.extend([pickup.lng, pickup.lat])
          if (dropoff) bounds.extend([dropoff.lng, dropoff.lat])
        }

        if (!bounds.isEmpty()) {
          nextMap.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 })
        }

        nextMap.on("load", () => setLoading(false))
        setTimeout(() => setLoading(false), 400)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError("Could not load the map. Use Navigate to open Google Maps.")
          setLoading(false)
        }
      }
    }

    boot()
    return () => {
      cancelled = true
      markers.forEach((m) => m.remove())
      map?.remove()
    }
  }, [pickupAddress, dropoffAddress, dropoffLat, dropoffLng, focus])

  return (
    <div className="mt-3 overflow-hidden border border-stone-200 bg-stone-100">
      <div className="relative h-56 w-full">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#faf8f5]/80 text-xs text-stone-500">
            Loading map…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#faf8f5] px-4 text-center text-xs text-stone-600">
            {error}
          </div>
        )}
      </div>
      <p className="border-t border-stone-200 bg-white px-3 py-2 text-[10px] text-stone-500">
        In-app map (OpenStreetMap). Use Navigate for turn-by-turn on your phone.
      </p>
    </div>
  )
}
