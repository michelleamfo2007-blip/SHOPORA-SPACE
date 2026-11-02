"use client"

import { useState } from "react"
import { resetRiderPasswordAction } from "@/server/actions/rider"
import { toast } from "sonner"

export function ResetRiderPasswordForm({ riderId, riderName }: { riderId: string; riderName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-slate-500 underline">
        Reset password
      </button>
    )
  }

  return (
    <form
      className="mt-2 flex flex-wrap items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        fd.set("riderId", riderId)
        const result = await resetRiderPasswordAction(fd)
        setLoading(false)
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success(`Password updated for ${riderName}`)
        setOpen(false)
        e.currentTarget.reset()
      }}
    >
      <input
        name="password"
        type="text"
        required
        minLength={6}
        placeholder="New password (6+)"
        className="h-8 rounded border border-slate-200 px-2 text-xs"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-8 rounded bg-slate-900 px-3 text-xs font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 underline">
        Cancel
      </button>
    </form>
  )
}
