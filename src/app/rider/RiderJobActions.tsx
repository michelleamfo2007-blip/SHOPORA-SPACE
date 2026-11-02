"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  acceptDeliveryJobAction,
  markJobDeliveredAction,
  markJobPickedUpAction,
  reportFailedDeliveryAction,
} from "@/server/actions/rider"
import { DELIVERY_CONFIG } from "@/lib/delivery-config"

export function RiderJobActions({
  jobId,
  status,
}: {
  jobId: string
  status: "PENDING" | "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "FAILED" | "CANCELLED"
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [showFail, setShowFail] = useState(false)

  async function run(action: () => Promise<{ error?: string; success?: boolean }>) {
    setLoading(true)
    setError(null)
    const result = await action()
    if (result.error) setError(result.error)
    else {
      setOtp("")
      setShowFail(false)
      router.refresh()
    }
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
        <div className="grid gap-2 rounded-lg border border-stone-200 bg-[#faf8f5] p-3">
          <label className="grid gap-1 text-xs text-stone-600">
            Customer’s 6-digit delivery code
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="••••••"
              className="h-11 border border-stone-300 bg-white px-3 text-center text-lg tracking-[0.3em] focus:border-stone-900 focus:outline-none"
            />
          </label>
          <button
            type="button"
            disabled={loading || otp.length !== 6}
            onClick={() => run(() => markJobDeliveredAction(jobId, otp))}
            className="h-10 rounded-full bg-stone-900 px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Confirm delivered"}
          </button>
        </div>
      )}

      {(status === "ASSIGNED" || status === "PICKED_UP") && (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowFail((v) => !v)}
            className="h-10 rounded-full border border-red-200 px-4 text-sm font-medium text-red-700"
          >
            Report failed delivery
          </button>
          {showFail && (
            <form
              className="grid gap-2 border border-red-100 bg-red-50/50 p-3"
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                fd.set("jobId", jobId)
                run(() => reportFailedDeliveryAction(fd))
              }}
            >
              <select name="reason" required className="h-10 border border-stone-300 bg-white px-3 text-sm">
                <option value="">Select reason</option>
                {DELIVERY_CONFIG.failReasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <textarea
                name="notes"
                rows={2}
                placeholder="Optional notes"
                className="border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-10 rounded-full bg-red-700 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Submit failure report"}
              </button>
            </form>
          )}
        </>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
