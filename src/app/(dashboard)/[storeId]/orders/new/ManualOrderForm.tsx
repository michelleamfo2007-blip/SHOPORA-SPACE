"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { recordManualOrderAction } from "@/server/actions/dashboard-tools"

type Item = { variantId: string; name: string; price: number; stockCount: number; imageUrl: string | null }
type Line = { variantId: string; quantity: number; price: string }

const inputClass =
  "h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"

export function ManualOrderForm({
  storeId,
  currency,
  items,
  sources,
}: {
  storeId: string
  currency: string
  items: Item[]
  sources: { value: string; label: string }[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [lines, setLines] = useState<Line[]>([])
  const [source, setSource] = useState(sources[0]?.value ?? "WHATSAPP")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [deliveryFee, setDeliveryFee] = useState("")
  const [notes, setNotes] = useState("")
  const [paid, setPaid] = useState(true)
  const [saving, setSaving] = useState(false)

  const byId = useMemo(() => new Map(items.map((i) => [i.variantId, i])), [items])
  const matches = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 8)
    : []
  const total = lines.reduce((sum, l) => sum + (Number(l.price) || 0) * l.quantity, 0)

  function add(item: Item) {
    setLines((prev) =>
      prev.some((l) => l.variantId === item.variantId)
        ? prev.map((l) => (l.variantId === item.variantId ? { ...l, quantity: l.quantity + 1 } : l))
        : [...prev, { variantId: item.variantId, quantity: 1, price: String(item.price) }]
    )
    setSearch("")
  }

  function update(variantId: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.variantId === variantId ? { ...l, ...patch } : l)))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (lines.length === 0) return toast.error("Add at least one product.")
    setSaving(true)
    const result = await recordManualOrderAction(storeId, {
      items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity, price: Number(l.price) })),
      customer: { name, phone, email },
      source,
      paid,
      deliveryAddress: address,
      deliveryFee: Number(deliveryFee) || 0,
      notes,
    })
    setSaving(false)
    if ("error" in result) return toast.error(result.error)
    toast.success("Order recorded")
    router.push(`/${storeId}/orders/${result.orderId}`)
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-950">Where did this order come from?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {sources.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSource(s.value)}
              className={`rounded-full border px-4 py-2 text-sm ${
                source === s.value ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 text-stone-700 hover:border-stone-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-950">Products</h2>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your products…"
            className={`${inputClass} pl-9`}
          />
          {matches.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
              {matches.map((item) => (
                <button
                  key={item.variantId}
                  type="button"
                  onClick={() => add(item)}
                  disabled={item.stockCount <= 0}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-stone-50 disabled:opacity-50"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
                  ) : (
                    <span className="h-9 w-9 rounded-md bg-stone-100" />
                  )}
                  <span className="flex-1">{item.name}</span>
                  <span className="text-stone-500">
                    {item.stockCount <= 0 ? "Out of stock" : `${item.stockCount} left · ${currency} ${item.price.toFixed(2)}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {lines.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">Search above and tap a product to add it.</p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100">
            {lines.map((line) => {
              const item = byId.get(line.variantId)
              if (!item) return null
              return (
                <li key={line.variantId} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="min-w-0 flex-1 text-sm font-medium text-stone-900">
                    {item.name}
                    <span className="block text-xs font-normal text-stone-500">{item.stockCount} in stock</span>
                  </span>
                  <div className="flex items-center rounded-lg border border-stone-200">
                    <button
                      type="button"
                      className="p-2"
                      aria-label="Less"
                      onClick={() => update(line.variantId, { quantity: Math.max(1, line.quantity - 1) })}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      className="p-2"
                      aria-label="More"
                      onClick={() => update(line.variantId, { quantity: Math.min(item.stockCount, line.quantity + 1) })}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <label className="flex items-center gap-1 text-sm text-stone-500">
                    {currency}
                    <input
                      value={line.price}
                      onChange={(e) => update(line.variantId, { price: e.target.value })}
                      inputMode="decimal"
                      className="h-9 w-24 rounded-lg border border-stone-200 px-2 text-right text-stone-900"
                      aria-label="Price each"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setLines((prev) => prev.filter((l) => l.variantId !== line.variantId))}
                    className="p-2 text-stone-400 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-2 text-right text-lg font-semibold text-stone-950">
          Total {currency} {total.toFixed(2)}
        </p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
        <h2 className="font-semibold text-stone-950 sm:col-span-2">Customer</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" className={inputClass} required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (for WhatsApp)" className={inputClass} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className={inputClass} />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery location (optional)" className={inputClass} />
        <input
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(e.target.value)}
          placeholder={`Delivery fee, ${currency} (optional)`}
          inputMode="decimal"
          className={inputClass}
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Private note (e.g. pick-up Saturday)"
          rows={2}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm sm:col-span-2"
        />
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-950">Payment</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            { value: true, title: "Already paid", hint: "Cash, MoMo or bank received" },
            { value: false, title: "Not paid yet", hint: "You can send a WhatsApp reminder" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setPaid(opt.value)}
              className={`rounded-xl border p-4 text-left ${paid === opt.value ? "border-stone-950 ring-1 ring-stone-950" : "border-stone-200"}`}
            >
              <span className="block text-sm font-semibold text-stone-950">{opt.title}</span>
              <span className="block text-xs text-stone-500">{opt.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="h-12 w-full rounded-full bg-stone-950 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {saving ? "Saving…" : `Save order · ${currency} ${total.toFixed(2)}`}
      </button>
    </form>
  )
}
