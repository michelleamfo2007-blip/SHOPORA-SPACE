"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { riderLoginAction } from "@/server/actions/rider"

export function RiderLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await riderLoginAction(new FormData(e.currentTarget))
      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      router.replace("/rider")
      router.refresh()
    } catch {
      setError("Could not sign in. Try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">Phone number</span>
        <input
          name="phone"
          type="tel"
          required
          placeholder="053XXXXXXX or +233XXXXXXXXX"
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-stone-600">Password</span>
        <input
          name="password"
          type="password"
          required
          className="h-11 border border-stone-300 px-3 focus:border-stone-900 focus:outline-none"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-full bg-stone-900 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-xs text-stone-500">
        Use the phone and password from signup. New accounts must be activated by Shopora first.
      </p>
    </form>
  )
}
