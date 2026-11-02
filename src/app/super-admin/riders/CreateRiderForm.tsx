"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createRiderAction } from "@/server/actions/rider"
import { toast } from "sonner"

export function CreateRiderForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    try {
      const result = await createRiderAction(formData)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success("Rider created — they can log in at /rider/login")
      form.reset()
      router.refresh()
    } catch (err) {
      console.error(err)
      const message = "Could not create rider. Try again."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
      <h2 className="md:col-span-2 text-lg font-bold text-slate-900">Add rider</h2>
      <input name="name" required placeholder="Full name" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
      <input name="phone" required placeholder="Phone (login)" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
      <input name="email" type="email" required placeholder="Email (for new-job alerts)" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
      <input name="momoNumber" placeholder="MoMo number (optional)" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
      <input name="password" type="password" required minLength={6} placeholder="Password (6+ chars)" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
      <select name="type" className="h-11 rounded-lg border border-slate-200 px-3 text-sm">
        <option value="MANAGED">Shopora managed</option>
        <option value="INDEPENDENT">Independent</option>
      </select>
      {error && (
        <p className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-xl bg-slate-900 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Create rider"}
      </button>
    </form>
  )
}
