"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Printer, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { tillSaleAction } from "@/server/actions/dashboard-tools"
import { TILL_PAYMENT_LABELS, TILL_PAYMENT_METHODS, receiptText, type Receipt } from "@/lib/pos-receipt"
import { toWhatsAppNumber } from "@/lib/payment-reminder"

type Item = {
  variantId: string
  name: string
  variantName: string | null
  price: number
  stockCount: number
  sku: string | null
  category: string | null
  imageUrl: string | null
}
type Summary = {
  date: string
  sales: number
  total: number
  itemsSold: number
  byMethod: { method: string; label: string; sales: number; total: number }[]
  recent: { id: string; orderNumber: string; total: number; paymentMethod: string | null; createdAt: string }[]
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

function printReceipt(r: Receipt) {
  const w = window.open("", "_blank", "width=380,height=640")
  if (!w) return toast.error("Allow pop-ups to print the receipt.")
  const fmt = (n: number) => `${r.currency} ${n.toFixed(2)}`
  w.document.write(`<!doctype html><html><head><title>Receipt ${escapeHtml(r.orderNumber)}</title>
    <style>body{font-family:ui-monospace,Menlo,monospace;font-size:12px;width:280px;margin:16px auto;color:#111}
    h1{font-size:16px;text-align:center;margin:0 0 4px}p{margin:2px 0}.c{text-align:center}.row{display:flex;justify-content:space-between;gap:8px}
    hr{border:0;border-top:1px dashed #999;margin:10px 0}.b{font-weight:700;font-size:14px}</style></head><body>
    <h1>${escapeHtml(r.storeName)}</h1><p class="c">${escapeHtml(r.orderNumber)} · ${escapeHtml(new Date(r.createdAt).toLocaleString("en-GB"))}</p><hr>
    ${r.lines
      .map((l) => `<div class="row"><span>${l.quantity} × ${escapeHtml(l.name)}</span><span>${fmt(l.price * l.quantity)}</span></div>`)
      .join("")}
    <hr><div class="row b"><span>Total</span><span>${fmt(r.total)}</span></div>
    <div class="row"><span>Paid by</span><span>${escapeHtml(TILL_PAYMENT_LABELS[r.paymentMethod] ?? r.paymentMethod)}</span></div>
    ${r.amountTendered != null ? `<div class="row"><span>Received</span><span>${fmt(r.amountTendered)}</span></div>` : ""}
    ${r.change ? `<div class="row"><span>Change</span><span>${fmt(r.change)}</span></div>` : ""}
    <hr><p class="c">Thank you for shopping with us!</p><p class="c">${escapeHtml(r.storeUrl.replace("https://", ""))}</p>
    <script>window.onload=()=>{window.print()}</script></body></html>`)
  w.document.close()
}

export function TillClient({
  storeId,
  storeName,
  currency,
  items,
  initialSummary,
}: {
  storeId: string
  storeName: string
  currency: string
  items: Item[]
  initialSummary: Summary
}) {
  const router = useRouter()
  const [tab, setTab] = useState<"sell" | "today">("sell")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [method, setMethod] = useState<string>("CASH")
  const [tendered, setTendered] = useState("")
  const [busy, setBusy] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [receiptPhone, setReceiptPhone] = useState("")
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [stock, setStock] = useState<Record<string, number>>(() => Object.fromEntries(items.map((i) => [i.variantId, i.stockCount])))

  const money = (n: number) => `${currency} ${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const byId = useMemo(() => new Map(items.map((i) => [i.variantId, i])), [items])
  const categories = useMemo(() => [...new Set(items.map((i) => i.category).filter(Boolean))] as string[], [items])
  const q = query.trim().toLowerCase()
  const visible = items.filter(
    (i) =>
      (!category || i.category === category) &&
      (!q || `${i.name} ${i.variantName ?? ""} ${i.sku ?? ""}`.toLowerCase().includes(q))
  )
  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ item: byId.get(id)!, qty }))
    .filter((l) => l.item)
  const total = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0)
  const count = lines.reduce((sum, l) => sum + l.qty, 0)
  const tenderedNum = Number(tendered)
  const change = method === "CASH" && tendered !== "" && Number.isFinite(tenderedNum) ? tenderedNum - total : null

  function add(item: Item) {
    const left = stock[item.variantId] ?? 0
    const inCart = cart[item.variantId] ?? 0
    if (inCart >= left) return toast.error(left <= 0 ? `${item.name} is out of stock` : `Only ${left} in stock`)
    setCart((c) => ({ ...c, [item.variantId]: inCart + 1 }))
  }

  function setQty(id: string, qty: number) {
    setCart((c) => {
      const next = { ...c }
      if (qty <= 0) delete next[id]
      else next[id] = Math.min(qty, stock[id] ?? qty)
      return next
    })
  }

  async function completeSale() {
    if (lines.length === 0) return toast.error("Add something to the sale first.")
    if (method === "CASH" && change != null && change < 0) return toast.error("Cash received is less than the total.")
    setBusy(true)
    const result = await tillSaleAction(storeId, {
      items: lines.map((l) => ({ variantId: l.item.variantId, quantity: l.qty })),
      paymentMethod: method,
      amountTendered: method === "CASH" && tendered !== "" ? tenderedNum : null,
    })
    setBusy(false)
    if ("error" in result) return toast.error(result.error)
    setStock((s) => {
      const next = { ...s }
      for (const l of lines) next[l.item.variantId] = (next[l.item.variantId] ?? 0) - l.qty
      return next
    })
    setSummary(JSON.parse(JSON.stringify(result.summary)))
    setReceipt(result.receipt)
    setCart({})
    setTendered("")
    router.refresh()
  }

  const waNumber = toWhatsAppNumber(receiptPhone)

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Shop till</h1>
          <p className="text-sm text-stone-500">Ring up walk-in sales. Stock updates on your website straight away.</p>
        </div>
        <div className="flex rounded-full border border-stone-200 bg-white p-1">
          {(["sell", "today"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm ${tab === t ? "bg-stone-950 text-white" : "text-stone-600"}`}
            >
              {t === "sell" ? "Sell" : `Today · ${money(summary.total)}`}
            </button>
          ))}
        </div>
      </div>

      {tab === "today" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-xs uppercase tracking-wide text-stone-500">Till sales today</p>
            <p className="mt-2 text-4xl font-semibold text-stone-950">{money(summary.total)}</p>
            <p className="mt-1 text-sm text-stone-500">
              {summary.sales} {summary.sales === 1 ? "sale" : "sales"} · {summary.itemsSold} items
            </p>
            <ul className="mt-6 divide-y divide-stone-100">
              {summary.byMethod.map((m) => (
                <li key={m.method} className="flex justify-between py-2.5 text-sm">
                  <span className="text-stone-700">{m.label}</span>
                  <span className="text-stone-500">
                    {m.sales} · <span className="font-medium text-stone-950">{money(m.total)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-stone-500">Count your cash drawer against the Cash line before you close.</p>
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-xs uppercase tracking-wide text-stone-500">Latest sales</p>
            {summary.recent.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">No till sales yet today.</p>
            ) : (
              <ul className="mt-3 divide-y divide-stone-100">
                {summary.recent.map((s) => (
                  <li key={s.id} className="flex justify-between py-2.5 text-sm">
                    <span className="text-stone-700">
                      {new Date(s.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {s.orderNumber}
                    </span>
                    <span className="text-stone-500">
                      {TILL_PAYMENT_LABELS[s.paymentMethod ?? ""] ?? "—"} · <span className="font-medium text-stone-950">{money(s.total)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or SKU"
                autoFocus
                className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm"
              />
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {[null, ...categories].map((c) => (
                  <button
                    key={c ?? "all"}
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-3 py-1 text-xs ${category === c ? "bg-stone-950 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}
                  >
                    {c ?? "All"}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => {
                const left = (stock[item.variantId] ?? 0) - (cart[item.variantId] ?? 0)
                return (
                  <button
                    key={item.variantId}
                    onClick={() => add(item)}
                    disabled={left <= 0}
                    className="group overflow-hidden rounded-xl border border-stone-200 bg-white text-left transition hover:border-stone-400 disabled:opacity-50"
                  >
                    <div className="aspect-square bg-stone-100">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-sm font-medium text-stone-900">{item.name}</p>
                      {item.variantName && <p className="truncate text-xs text-stone-500">{item.variantName}</p>}
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-950">{money(item.price)}</span>
                        <span className={left <= 0 ? "text-red-600" : "text-stone-400"}>{left <= 0 ? "Sold out" : `${left} left`}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-950">Current sale</h2>
              {lines.length > 0 && (
                <button onClick={() => setCart({})} className="text-xs text-stone-500 hover:text-red-600">
                  Clear
                </button>
              )}
            </div>
            {lines.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-500">Tap products to add them.</p>
            ) : (
              <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
                {lines.map(({ item, qty }) => (
                  <li key={item.variantId} className="flex items-center gap-2 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-stone-900">{item.name}</span>
                      <span className="block text-xs text-stone-500">
                        {item.variantName ? `${item.variantName} · ` : ""}
                        {money(item.price)}
                      </span>
                    </span>
                    <div className="flex items-center rounded-lg border border-stone-200">
                      <button className="p-1.5" onClick={() => setQty(item.variantId, qty - 1)} aria-label="Less">
                        {qty === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                      </button>
                      <span className="w-6 text-center text-sm">{qty}</span>
                      <button className="p-1.5" onClick={() => setQty(item.variantId, qty + 1)} aria-label="More">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-baseline justify-between border-t border-stone-100 pt-3">
              <span className="text-sm text-stone-500">{count} items</span>
              <span className="text-2xl font-semibold text-stone-950">{money(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TILL_PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={`rounded-lg border py-2 text-sm ${method === m.value ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 text-stone-700"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === "CASH" && (
              <div className="space-y-2">
                <input
                  value={tendered}
                  onChange={(e) => setTendered(e.target.value)}
                  inputMode="decimal"
                  placeholder={`Cash received (${currency})`}
                  className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...(total > 0 ? [{ label: "Exact", value: total }] : []),
                    ...[20, 50, 100, 200, 500]
                      .filter((v) => v > total)
                      .slice(0, 3)
                      .map((v) => ({ label: money(v), value: v })),
                  ].map((q) => (
                    <button
                      key={q.label}
                      onClick={() => setTendered(String(q.value))}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                {change != null && (
                  <p className={`text-sm font-medium ${change < 0 ? "text-red-600" : "text-emerald-700"}`}>
                    {change < 0 ? `Short by ${money(-change)}` : `Change: ${money(change)}`}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={completeSale}
              disabled={busy || lines.length === 0}
              className="h-12 w-full rounded-full bg-stone-950 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : `Complete sale · ${money(total)}`}
            </button>
          </aside>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setReceipt(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700">Sale complete</p>
                <p className="mt-1 text-2xl font-semibold text-stone-950">{money(receipt.total)}</p>
                <p className="text-sm text-stone-500">
                  {receipt.orderNumber} · {TILL_PAYMENT_LABELS[receipt.paymentMethod]}
                  {receipt.change ? ` · Change ${money(receipt.change)}` : ""}
                </p>
              </div>
              <button onClick={() => setReceipt(null)} aria-label="Close">
                <X className="h-5 w-5 text-stone-400" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <button
                onClick={() => printReceipt(receipt)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-stone-300 text-sm font-medium text-stone-900 hover:bg-stone-50"
              >
                <Printer className="h-4 w-4" /> Print receipt
              </button>
              <div className="flex gap-2">
                <input
                  value={receiptPhone}
                  onChange={(e) => setReceiptPhone(e.target.value)}
                  placeholder="Customer's WhatsApp number"
                  inputMode="tel"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-stone-200 px-3 text-sm"
                />
                <a
                  href={waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(receiptText(receipt))}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!waNumber}
                  className={`flex h-11 items-center rounded-full px-4 text-sm font-medium text-white ${waNumber ? "bg-emerald-600 hover:bg-emerald-700" : "pointer-events-none bg-emerald-600/40"}`}
                >
                  Send
                </a>
              </div>
              <button onClick={() => setReceipt(null)} className="h-11 w-full rounded-full bg-stone-950 text-sm font-semibold text-white">
                New sale
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-stone-400">{storeName}</p>
          </div>
        </div>
      )}
    </div>
  )
}
