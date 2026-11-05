"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, MessageCircle, Search } from "lucide-react"
import { toast } from "sonner"
import { saveCustomerNotesAction } from "@/server/actions/dashboard-tools"
import { toWhatsAppNumber } from "@/lib/payment-reminder"

type Customer = {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  tags: string[]
  orderCount: number
  spent: number
}

function CustomerEditor({
  storeId,
  customer,
  suggestedTags,
  onSaved,
}: {
  storeId: string
  customer: Customer
  suggestedTags: string[]
  onSaved: () => void
}) {
  const [notes, setNotes] = useState(customer.notes ?? "")
  const [tags, setTags] = useState<string[]>(customer.tags)
  const [custom, setCustom] = useState("")
  const [saving, setSaving] = useState(false)
  const options = [...new Set([...suggestedTags, ...tags])]

  function toggle(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  async function save() {
    setSaving(true)
    const result = await saveCustomerNotesAction(storeId, customer.id, notes, tags)
    setSaving(false)
    if ("error" in result) return toast.error(result.error)
    toast.success("Saved")
    onSaved()
  }

  return (
    <div className="space-y-3 bg-stone-50 px-6 py-4">
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              tags.includes(tag) ? "border-stone-950 bg-stone-950 text-white" : "border-stone-300 bg-white text-stone-700"
            }`}
          >
            {tag}
          </button>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const t = custom.trim()
            if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
            setCustom("")
          }}
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="+ New tag"
            className="h-7 w-28 rounded-full border border-dashed border-stone-300 bg-white px-3 text-xs"
          />
        </form>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Private notes — sizes they like, where they live, payment habits…"
        className="w-full rounded-lg border border-stone-200 bg-white p-3 text-sm"
      />
      <button
        onClick={save}
        disabled={saving}
        className="h-9 rounded-full bg-stone-950 px-5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save notes & tags"}
      </button>
    </div>
  )
}

export function CustomerList({
  storeId,
  currency,
  customers,
  suggestedTags,
  notesEnabled,
}: {
  storeId: string
  currency: string
  customers: Customer[]
  suggestedTags: string[]
  notesEnabled: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const allTags = [...new Set(customers.flatMap((c) => c.tags))]
  const q = query.trim().toLowerCase()
  const visible = customers.filter(
    (c) =>
      (!tagFilter || c.tags.includes(tagFilter)) &&
      (!q || `${c.name} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(q))
  )

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone or email"
            className="h-9 w-full rounded-lg border border-stone-200 pl-9 pr-3 text-sm"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTagFilter(null)}
              className={`rounded-full px-3 py-1 text-xs ${!tagFilter ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700"}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
                className={`rounded-full px-3 py-1 text-xs ${tagFilter === tag ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="px-6 py-12 text-center font-medium text-slate-500">{customers.length ? "No customers match." : "No customers yet."}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((c) => {
            const wa = toWhatsAppNumber(c.phone)
            return (
              <li key={c.id}>
                <div className="flex items-center gap-4 px-6 py-4">
                  <button
                    onClick={() => notesEnabled && setOpen(open === c.id ? null : c.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold uppercase text-blue-700">
                      {c.name.substring(0, 2)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-slate-900">{c.name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {[c.phone, c.email].filter(Boolean).join(" · ") || "No contact details"}
                      </span>
                      {(c.tags.length > 0 || c.notes) && (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                              {t}
                            </span>
                          ))}
                          {c.notes && <span className="text-[10px] text-stone-400">· has notes</span>}
                        </span>
                      )}
                    </span>
                  </button>
                  <div className="hidden text-right text-xs text-slate-500 sm:block">
                    <span className="block font-semibold text-slate-900">
                      {currency} {c.spent.toFixed(2)}
                    </span>
                    {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                  </div>
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-emerald-600/30 bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                      aria-label={`Message ${c.name} on WhatsApp`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                  {notesEnabled && (
                    <button onClick={() => setOpen(open === c.id ? null : c.id)} aria-label="Notes and tags">
                      <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${open === c.id ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
                {notesEnabled && open === c.id && (
                  <CustomerEditor storeId={storeId} customer={c} suggestedTags={suggestedTags} onSaved={() => router.refresh()} />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
