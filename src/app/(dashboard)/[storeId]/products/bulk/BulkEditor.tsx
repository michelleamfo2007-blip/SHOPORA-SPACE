"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BulkRow } from "@/lib/bulk-products"
import { bulkUpdateProductsAction } from "@/server/actions/dashboard-tools"

type Draft = { price: string; costPrice: string; stockCount: string }

const toDraft = (r: BulkRow): Draft => ({
  price: String(r.price),
  costPrice: r.costPrice == null ? "" : String(r.costPrice),
  stockCount: String(r.stockCount),
})

export function BulkEditor({ storeId, currency, rows }: { storeId: string; currency: string; rows: BulkRow[] }) {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(rows.map((r) => [r.key, toDraft(r)])))
  const [filter, setFilter] = useState("")
  const [percent, setPercent] = useState("")
  const [saving, setSaving] = useState(false)

  const original = Object.fromEntries(rows.map((r) => [r.key, toDraft(r)]))
  const changed = rows.filter((r) => {
    const d = drafts[r.key]
    const o = original[r.key]
    return d.price !== o.price || d.costPrice !== o.costPrice || d.stockCount !== o.stockCount
  })
  const visible = rows.filter((r) => `${r.name} ${r.variantName ?? ""}`.toLowerCase().includes(filter.trim().toLowerCase()))

  function set(key: string, field: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  function applyPercent() {
    const p = Number(percent)
    if (!Number.isFinite(p) || p === 0) return toast.error("Enter a percentage, e.g. 10 or -15.")
    setDrafts((prev) => {
      const next = { ...prev }
      for (const r of visible) {
        const current = Number(prev[r.key].price) || 0
        next[r.key] = { ...prev[r.key], price: String(Math.max(0, Math.round(current * (1 + p / 100) * 100) / 100)) }
      }
      return next
    })
  }

  async function save() {
    if (changed.length === 0) return
    setSaving(true)
    const result = await bulkUpdateProductsAction(
      storeId,
      changed.map((r) => {
        const d = drafts[r.key]
        const o = original[r.key]
        return {
          key: r.key,
          ...(d.price !== o.price ? { price: d.price } : {}),
          ...(d.costPrice !== o.costPrice ? { costPrice: d.costPrice } : {}),
          ...(d.stockCount !== o.stockCount ? { stockCount: d.stockCount } : {}),
        }
      })
    )
    setSaving(false)
    if ("error" in result) return toast.error(result.error)
    toast.success(`Saved ${result.saved} ${result.saved === 1 ? "row" : "rows"}`)
    router.refresh()
  }

  const cell = "h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-right text-sm focus:border-stone-400 focus:outline-none"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:flex-row md:items-center">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter products…"
          className="h-10 flex-1 rounded-lg border border-stone-200 px-3 text-sm"
        />
        <div className="flex items-center gap-2 text-sm text-stone-600">
          Change prices of shown rows by
          <input value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="10" className="h-10 w-16 rounded-lg border border-stone-200 px-2 text-right" />
          %
          <button onClick={applyPercent} className="h-10 rounded-lg border border-stone-300 px-3 font-medium text-stone-900 hover:bg-stone-50">
            Apply
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="w-32 px-2 py-3 text-right font-medium">Price ({currency})</th>
              <th className="w-32 px-2 py-3 text-right font-medium">Cost ({currency})</th>
              <th className="w-28 px-2 py-3 text-right font-medium">Stock</th>
              <th className="w-24 px-4 py-3 text-right font-medium">Profit each</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.map((r) => {
              const d = drafts[r.key]
              const isChanged = changed.includes(r)
              const profit = d.costPrice === "" ? null : (Number(d.price) || 0) - (Number(d.costPrice) || 0)
              return (
                <tr key={r.key} className={isChanged ? "bg-amber-50/60" : ""}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.imageUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
                      ) : (
                        <span className="h-9 w-9 rounded-md bg-stone-100" />
                      )}
                      <span>
                        <span className="block font-medium text-stone-900">{r.name}</span>
                        {r.variantName && <span className="block text-xs text-stone-500">{r.variantName}</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <input value={d.price} onChange={(e) => set(r.key, "price", e.target.value)} inputMode="decimal" className={cell} />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={d.costPrice}
                      onChange={(e) => set(r.key, "costPrice", e.target.value)}
                      inputMode="decimal"
                      placeholder="—"
                      className={cell}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input value={d.stockCount} onChange={(e) => set(r.key, "stockCount", e.target.value)} inputMode="numeric" className={cell} />
                  </td>
                  <td className={`px-4 py-2 text-right ${profit != null && profit < 0 ? "text-red-600" : "text-stone-600"}`}>
                    {profit == null ? "—" : profit.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving || changed.length === 0}
          className="h-12 rounded-full bg-stone-950 px-8 text-sm font-semibold text-white shadow-lg hover:bg-stone-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : changed.length ? `Save ${changed.length} change${changed.length === 1 ? "" : "s"}` : "No changes"}
        </button>
      </div>
    </div>
  )
}
