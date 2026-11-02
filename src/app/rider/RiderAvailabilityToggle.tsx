"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setRiderOnlineAction } from "@/server/actions/rider"

export function RiderAvailabilityToggle({ isOnline }: { isOnline: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setLoading(true)
    setError(null)
    const result = await setRiderOnlineAction(!isOnline)
    if (result.error) setError(result.error)
    else router.refresh()
    setLoading(false)
  }

  return (
    <div className="border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Availability</p>
          <p className="mt-1 text-lg font-medium text-stone-900">
            {isOnline ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-stone-300" /> Offline
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {isOnline
              ? "You can accept Accra jobs. One active delivery at a time."
              : "Go online to receive and accept new delivery jobs."}
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={toggle}
          className={`h-10 shrink-0 rounded-full px-5 text-sm font-medium disabled:opacity-60 ${
            isOnline
              ? "border border-stone-300 text-stone-800"
              : "bg-emerald-700 text-white"
          }`}
        >
          {loading ? "…" : isOnline ? "Go offline" : "Go online"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}
