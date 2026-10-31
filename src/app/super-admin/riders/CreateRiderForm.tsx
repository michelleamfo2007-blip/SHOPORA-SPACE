"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createRiderAction } from "@/server/actions/rider"
import { toast } from "sonner"

export function CreateRiderForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createRiderAction(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Rider created")
    e.currentTarget.reset()
    router.refresh()
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
