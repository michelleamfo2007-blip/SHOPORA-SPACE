"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { riderSignupAction } from "@/server/actions/rider"
import { RIDER_PLATFORM_CUT_PERCENT } from "@/lib/rider-terms"

export function RiderSignupForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [accepted, setAccepted] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!accepted) {
      setError(
        `You must accept the terms, including Shopora’s ${RIDER_PLATFORM_CUT_PERCENT}% fee on each delivery.`
      )
      return
    }
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set("acceptTerms", "true")
    const result = await riderSignupAction(fd)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="mt-8 border border-stone-200 bg-[#faf8f5] px-5 py-6">
        <p className="font-display text-2xl text-stone-900">Application received</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Shopora will review your details and activate your account. You’ll be able to log in once you’re
          approved — usually same day during working hours.
        </p>
        <button
          type="button"
          onClick={() => router.push("/rider/login")}
          className="mt-5 h-11 w-full rounded-full bg-stone-900 text-sm font-medium text-white"
        >
          Go to login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">Full name</span>
        <input
          name="name"
          required
          autoComplete="name"
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">Phone number</span>
        <input
          name="phone"
          type="tel"
          required
          placeholder="024XXXXXXX"
          autoComplete="tel"
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">MoMo number (optional)</span>
        <input
          name="momoNumber"
          type="tel"
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">Create a password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">Confirm password</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>

      <div className="border border-stone-200 bg-[#faf8f5] px-4 py-3 text-sm text-stone-700">
        <p className="font-medium text-stone-900">
          Shopora takes {RIDER_PLATFORM_CUT_PERCENT}% of every delivery fee.
        </p>
        <p className="mt-1 text-xs leading-relaxed text-stone-600">
          You collect the fee from the customer on arrival, keep {100 - RIDER_PLATFORM_CUT_PERCENT}%, and
          settle Shopora’s cut weekly via MoMo.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 border-stone-400"
        />
        <span>
          I Agree — I have read and accept the{" "}
          <Link href="/rider/terms" target="_blank" className="underline">
            Shopora Space Delivery Rider Terms and Conditions
          </Link>
          , including the {RIDER_PLATFORM_CUT_PERCENT}% Shopora / {100 - RIDER_PLATFORM_CUT_PERCENT}% rider
          delivery-fee split.
        </span>
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading || !accepted}
        className="h-11 rounded-full bg-stone-900 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Apply as rider"}
      </button>
      <p className="text-center text-xs text-stone-500">Accra only for now. Shopora must approve your account before you can take jobs.</p>
    </form>
  )
}
