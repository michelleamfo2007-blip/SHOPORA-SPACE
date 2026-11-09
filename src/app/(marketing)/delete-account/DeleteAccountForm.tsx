"use client"

import { useState } from "react"
import { requestAccountDeletionAction } from "@/server/actions/account-deletion"

const input = "h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm focus:border-stone-500 focus:outline-none"

export function DeleteAccountForm() {
  const [accountType, setAccountType] = useState("seller")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const result = await requestAccountDeletionAction({ accountType, email, name, reason })
    setBusy(false)
    if ("error" in result) return setError(result.error ?? "Something went wrong.")
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-stone-900/10 bg-white p-6">
        <p className="font-display text-2xl">Request received</p>
        <p className="mt-2 text-sm text-stone-600">
          We&apos;ve emailed {email} to confirm. Your account will be deleted within 30 days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["seller", "Seller"],
          ["rider", "Rider"],
          ["customer", "Customer"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setAccountType(value)}
            className={`rounded-full border px-4 py-2 text-sm ${
              accountType === value ? "border-stone-950 bg-stone-950 text-white" : "border-stone-300 bg-white text-stone-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email on your account" className={input} />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className={input} />
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Anything you'd like to tell us? (optional)"
        className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="h-11 rounded-full bg-stone-950 px-6 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
        {busy ? "Sending…" : "Request account deletion"}
      </button>
    </form>
  )
}
