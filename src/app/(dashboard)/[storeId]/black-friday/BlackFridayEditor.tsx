"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BlackFridayRow } from "@/lib/black-friday-rows"
import { saveBlackFridayPricesAction, setBlackFridayOnAction } from "@/server/actions/black-friday"

export function BlackFridayEditor({
  storeId,
  currency,
  saleOn,
  rows,
}: {
  storeId: string
  currency: string
  saleOn: boolean
  rows: BlackFridayRow[]
}) {
  const router = useRouter()
  const [on, setOn] = useState(saleOn)
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.key, r.blackFridayPrice == null ? "" : String(r.blackFridayPrice)]))
  )
  const [percent, setPercent] = useState("20")
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)

  const original = Object.fromEntries(rows.map((r) => [r.key, r.blackFridayPrice == null ? "" : String(r.blackFridayPrice)]))
  const changed = rows.filter((r) => (drafts[r.key] ?? "") !== original[r.key])

  async function toggle(next: boolean) {
    setToggling(true)
    const result = await setBlackFridayOnAction(storeId, next)
    setToggling(false)
    if ("error" in result) return toast.error(result.error)
    setOn(next)
    toast.success(next ? "Black Friday is on. Shoppers now see sale prices you set." : "Black Friday is off. Regular prices are back.")
    router.refresh()
  }

  async function save() {
    if (changed.length === 0) return
    setSaving(true)
    const result = await saveBlackFridayPricesAction(
      storeId,
      changed.map((r) => ({ key: r.key, blackFridayPrice: drafts[r.key] }))
    )
    setSaving(false)
    if ("error" in result) return toast.error(result.error)
    toast.success(`Saved ${result.saved} ${result.saved === 1 ? "price" : "prices"}`)
    router.refresh()
  }

  function applyOff() {
    const p = Number(percent)
    if (!Number.isFinite(p) || p <= 0 || p >= 100) return toast.error("Enter a discount between 1 and 99.")
    setDrafts((prev) => {
      const next = { ...prev }
      for (const r of rows) {
        next[r.key] = String(Math.max(0.01, Math.round(r.regularPrice * (1 - p / 100) * 100) / 100))
      }
      return next
    })
  }

  const cell = "h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-right text-sm focus:border-stone-400 focus:outline-none"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-stone-900">{on ? "Sale is live" : "Sale is off"}</p>
          <p className="text-sm text-stone-500">
            Regular prices stay as they are. Shoppers only see these sale prices while this is on.
          </p>
        </div>
        <button
          type="button"
          disabled={toggling}
          onClick={() => toggle(!on)}
          className={`h-11 rounded-full px-6 text-sm font-semibold disabled:opacity-50 ${
            on ? "bg-stone-950 text-white" : "border border-stone-300 bg-white text-stone-900"
          }`}
        >
          {toggling ? "Updating…" : on ? "Turn sale off" : "Turn sale on"}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:flex-row md:items-center">
        <p className="flex-1 text-sm text-stone-600">Fill every shown row with a discount off the regular price</p>
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <input value={percent} onChange={(e) => setPercent(e.target.value)} className="h-10 w-16 rounded-lg border border-stone-200 px-2 text-right" />
          %
          <button type="button" onClick={applyOff} className="h-10 rounded-lg border border-stone-300 px-3 font-medium text-stone-900 hover:bg-stone-50">
            Fill prices
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="w-32 px-2 py-3 text-right font-medium">Regular ({currency})</th>
              <th className="w-36 px-2 py-3 text-right font-medium">Black Friday ({currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-stone-500">
                  Add products first, then set their sale prices here.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const isChanged = changed.includes(r)
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
                    <td className="px-2 py-2 text-right text-stone-600">{r.regularPrice.toFixed(2)}</td>
                    <td className="px-2 py-2">
                      <input
                        value={drafts[r.key] ?? ""}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [r.key]: e.target.value }))}
                        inputMode="decimal"
                        placeholder="—"
                        className={cell}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving || changed.length === 0}
          className="h-12 rounded-full bg-stone-950 px-8 text-sm font-semibold text-white shadow-lg hover:bg-stone-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : changed.length ? `Save ${changed.length} price${changed.length === 1 ? "" : "s"}` : "No changes"}
        </button>
      </div>
    </div>
  )
}
