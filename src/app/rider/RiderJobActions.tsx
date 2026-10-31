"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  acceptDeliveryJobAction,
  markJobDeliveredAction,
  markJobPickedUpAction,
} from "@/server/actions/rider"

export function RiderJobActions({
  jobId,
  status,
}: {
  jobId: string
  status: "PENDING" | "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "CANCELLED"
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run(action: () => Promise<{ error?: string; success?: boolean }>) {
    setLoading(true)
    setError(null)
    const result = await action()
    if (result.error) setError(result.error)
    else router.refresh()
    setLoading(false)
  }

  return (
    <div className="mt-3 grid gap-2">
      {status === "PENDING" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => acceptDeliveryJobAction(jobId))}
          className="h-10 rounded-full bg-stone-900 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Accepting…" : "Accept delivery"}
        </button>
      )}
      {status === "ASSIGNED" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => markJobPickedUpAction(jobId))}
          className="h-10 rounded-full bg-stone-900 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Updating…" : "Mark picked up"}
        </button>
      )}
      {status === "PICKED_UP" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => markJobDeliveredAction(jobId))}
          className="h-10 rounded-full border border-stone-900 px-4 text-sm font-medium text-stone-900 disabled:opacity-60"
        >
          {loading ? "Updating…" : "Mark delivered"}
        </button>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
