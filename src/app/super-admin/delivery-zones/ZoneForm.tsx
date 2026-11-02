"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertDeliveryZoneAction } from "@/server/actions/delivery-zones"
import { toast } from "sonner"

type Zone = {
  id: string
  name: string
  keywords: string
  feeMultiplier: number
  flatAdd: number
  minFee: number | null
  maxFee: number | null
  sortOrder: number
  isActive: boolean
}

export function ZoneForm({ zone }: { zone?: Zone }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <form
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData(e.currentTarget)
        if (zone) fd.set("id", zone.id)
        fd.set("isActive", (e.currentTarget.elements.namedItem("isActive") as HTMLInputElement).checked ? "true" : "false")
        const result = await upsertDeliveryZoneAction(fd)
        setLoading(false)
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success(zone ? "Zone updated" : "Zone created")
        if (!zone) e.currentTarget.reset()
        router.refresh()
      }}
    >
      {!zone && <h2 className="md:col-span-2 text-lg font-bold text-slate-900">Add zone</h2>}
      <input
        name="name"
        required
        defaultValue={zone?.name}
        placeholder="Zone name"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <input
        name="keywords"
        required
        defaultValue={zone?.keywords}
        placeholder="Keywords (comma-separated)"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <input
        name="feeMultiplier"
        type="number"
        step="0.05"
        min="0.1"
        required
        defaultValue={zone?.feeMultiplier ?? 1}
        placeholder="Multiplier e.g. 1.15"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <input
        name="flatAdd"
        type="number"
        step="1"
        defaultValue={zone?.flatAdd ?? 0}
        placeholder="Flat add GHS"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <input
        name="minFee"
        type="number"
        step="1"
        defaultValue={zone?.minFee ?? ""}
        placeholder="Min fee (optional)"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <input
        name="maxFee"
        type="number"
        step="1"
        defaultValue={zone?.maxFee ?? ""}
        placeholder="Max fee (optional)"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <input
        name="sortOrder"
        type="number"
        defaultValue={zone?.sortOrder ?? 0}
        placeholder="Sort order"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="isActive" type="checkbox" defaultChecked={zone?.isActive ?? true} />
        Active
      </label>
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-xl bg-slate-900 text-sm font-bold text-white disabled:opacity-60 md:col-span-2"
      >
        {loading ? "Saving…" : zone ? "Update zone" : "Create zone"}
      </button>
    </form>
  )
}
