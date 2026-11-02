"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { rateRiderAction } from "@/server/actions/rider"

export function RateRiderForm({
  trackingToken,
  riderName,
}: {
  trackingToken: string
  riderName: string
}) {
  const router = useRouter()
  const [stars, setStars] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="mt-6 border border-stone-200 bg-white px-5 py-5 text-center">
        <p className="font-display text-2xl">Thanks for your feedback</p>
        <p className="mt-2 text-sm text-stone-600">Your rating helps keep Shopora Delivery reliable.</p>
      </div>
    )
  }

  return (
    <form
      className="mt-6 border border-stone-200 bg-white px-5 py-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const fd = new FormData(e.currentTarget)
        fd.set("trackingToken", trackingToken)
        fd.set("stars", String(stars))
        const result = await rateRiderAction(fd)
        setLoading(false)
        if (result.error) {
          setError(result.error)
          return
        }
        setDone(true)
        router.refresh()
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Rate your rider</p>
      <p className="mt-1 text-sm text-stone-700">How was delivery with {riderName}?</p>
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            className={`h-10 w-10 rounded-full text-sm font-medium ${
              n <= stars ? "bg-stone-900 text-white" : "border border-stone-300 text-stone-500"
            }`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={2}
        placeholder="Optional comment"
        className="mt-4 w-full border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 h-11 w-full rounded-full bg-stone-900 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : "Submit rating"}
      </button>
    </form>
  )
}
