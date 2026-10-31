"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { settleRiderWalletAction } from "@/server/actions/rider"
import { toast } from "sonner"

export function SettleRiderForm({ riderId, maxAmount }: { riderId: string; maxAmount: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("riderId", riderId)
    const result = await settleRiderWalletAction(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Settlement recorded")
    e.currentTarget.reset()
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-xs text-slate-600">
        Amount received (GHS)
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={maxAmount}
          defaultValue={maxAmount.toFixed(2)}
          required
          className="h-10 w-36 rounded-lg border border-slate-200 px-3 text-sm"
        />
      </label>
      <label className="grid min-w-[200px] flex-1 gap-1 text-xs text-slate-600">
        Note / MoMo reference
        <input
          name="note"
          placeholder="e.g. MoMo TXN-123"
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Mark settled"}
      </button>
    </form>
  )
}
