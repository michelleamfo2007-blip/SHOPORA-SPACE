function mapsDirUrl(destination: string, origin?: string) {
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  })
  if (origin) params.set("origin", origin)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function RiderMapLinks({
  pickupAddress,
  dropoffAddress,
  dropoffLat,
  dropoffLng,
  status,
}: {
  pickupAddress: string
  dropoffAddress: string
  dropoffLat?: number | null
  dropoffLng?: number | null
  status: "PENDING" | "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "FAILED" | "CANCELLED"
}) {
  // The customer's exact pin beats the typed address for navigation.
  const dropoff = dropoffLat != null && dropoffLng != null ? `${dropoffLat},${dropoffLng}` : dropoffAddress

  if (status === "PENDING") {
    return (
      <a
        href={mapsDirUrl(dropoff, pickupAddress)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800"
      >
        Preview route on map
      </a>
    )
  }

  if (status === "ASSIGNED") {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <a
          href={mapsDirUrl(pickupAddress)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-full bg-stone-900 px-4 text-sm font-medium text-white"
        >
          Navigate to pickup
        </a>
        <a
          href={mapsDirUrl(dropoff, pickupAddress)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800"
        >
          Full route
        </a>
      </div>
    )
  }

  if (status === "PICKED_UP") {
    return (
      <a
        href={mapsDirUrl(dropoff)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-stone-900 px-4 text-sm font-medium text-white"
      >
        Navigate to customer{dropoff !== dropoffAddress ? " (exact pin)" : ""}
      </a>
    )
  }

  return null
}
