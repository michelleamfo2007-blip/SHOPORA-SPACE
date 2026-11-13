import type { ReactNode } from "react"

/** App screens for the App Store and Google Play screenshots, drawn at the same scale as the landing page mockups. */

export type ShotProduct = { name: string; price: number; image: string; images: string[]; stock: number }

const money = (n: number) => `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[7.5px] uppercase tracking-[0.2em] text-stone-500">{children}</p>
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-stone-200/80 bg-white p-2.5 ${className}`}>{children}</div>
}

function Thumb({ src, className = "" }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`bg-stone-200 object-cover ${className}`} />
}

export function LockScreen({ wallpaper }: { wallpaper: string }) {
  const alerts = [
    ["now", "New order · GHS 150.00", "Ama placed order ORD-482193. Check the payment and verify it."],
    ["12m ago", "New order · GHS 85.00", "Efua placed order ORD-482188. Check the payment and verify it."],
    ["1h ago", "New order · GHS 235.00", "Kojo placed order ORD-482176. Check the payment and verify it."],
  ]
  return (
    <>
      <Thumb src={wallpaper} className="absolute inset-0 h-full w-full scale-110 blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
      <div className="relative px-3 pt-14 text-white">
        <p className="text-center text-[9px] font-medium text-white/80">Friday 13 November</p>
        <p className="text-center text-[52px] font-light leading-none tracking-tight">9:41</p>
        <div className="mt-6 space-y-1.5">
          {alerts.map(([when, title, body]) => (
            <div key={title} className="rounded-2xl bg-white/85 px-2.5 py-2 text-[#1c1917] shadow-lg backdrop-blur">
              <div className="flex items-center gap-1.5">
                <span className="grid h-3.5 w-3.5 place-items-center rounded-[4px] bg-[#1c1917] text-[7px] font-bold text-[#c8a165]">
                  S
                </span>
                <span className="text-[7px] uppercase tracking-[0.16em] text-stone-500">Shopora</span>
                <span className="ml-auto text-[7px] text-stone-500">{when}</span>
              </div>
              <p className="mt-1 text-[9.5px] font-semibold">{title}</p>
              <p className="text-[8.5px] leading-snug text-stone-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function VerifyOrderScreen({ items }: { items: ShotProduct[] }) {
  const lines = items.slice(0, 2).map((p, i) => ({ ...p, qty: i === 0 ? 1 : 1, option: i === 0 ? "Gold" : "One size" }))
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  return (
    <>
      <p className="text-[9px] text-stone-500">← Orders</p>
      <p className="mt-1 font-display text-[20px] leading-tight">Order #ORD-482193</p>
      <span className="mt-1 inline-block rounded-full bg-[#fef3c7] px-2 py-0.5 text-[8px] font-semibold text-[#b45309]">
        Payment to check
      </span>
      <div className="mt-2.5 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-2.5 text-[9px] leading-snug">
        <p className="font-semibold">Ama Owusu paid by MTN MoMo</p>
        <p className="text-stone-700">Reference 7712345690</p>
        <p className="text-stone-500">Expected {money(subtotal)}</p>
      </div>
      <Card className="mt-1.5">
        <Label>Items</Label>
        {lines.map((l) => (
          <div key={l.name} className="mt-2 flex items-center gap-2">
            <Thumb src={l.image} className="h-9 w-9 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-medium">{l.name}</p>
              <p className="text-[8px] text-stone-500">{l.option} · Qty {l.qty}</p>
            </div>
            <p className="text-[9px]">{money(l.price * l.qty)}</p>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-stone-100 pt-1.5 text-[9px] font-semibold">
          <span>Total</span>
          <span>{money(subtotal)}</span>
        </div>
      </Card>
      <Card className="mt-1.5 text-[9px]">
        <Label>Delivery</Label>
        <p className="mt-1 font-semibold">Shopora Delivery · Accra</p>
        <p className="text-stone-500">East Legon, blue gate opposite Total</p>
        <p className="mt-1 font-medium text-[#047857]">Exact pin saved</p>
      </Card>
      <div className="mt-3 rounded-full bg-[#1c1917] py-2.5 text-center text-[10px] font-semibold text-white">Verify payment</div>
    </>
  )
}

export function TillScreen({ items }: { items: ShotProduct[] }) {
  const cart: Record<number, number> = { 0: 2, 2: 1 }
  const tiles = items.slice(0, 9)
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  const total = Object.entries(cart).reduce((s, [i, q]) => s + (tiles[Number(i)]?.price ?? 0) * q, 0)
  return (
    <>
      <p className="text-[9px] text-stone-500">← Home</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="font-display text-[20px] leading-none">Shop till</p>
        <div className="flex rounded-full bg-stone-200/70 p-0.5 text-[8px] font-medium">
          <span className="rounded-full bg-[#1c1917] px-2 py-0.5 text-white">Sell</span>
          <span className="px-2 py-0.5 text-stone-600">Today</span>
        </div>
      </div>
      <div className="mt-2 rounded-full border border-stone-200 bg-white px-2.5 py-1.5 text-[8.5px] text-stone-400">
        Search products
      </div>
      <div className="mt-1.5 flex gap-1 text-[7.5px]">
        {["All", "Rings", "Sets", "Earrings"].map((c, i) => (
          <span
            key={c}
            className={`rounded-full border px-2 py-0.5 ${i === 0 ? "border-[#1c1917] bg-[#1c1917] text-white" : "border-stone-200 bg-white text-stone-600"}`}
          >
            {c}
          </span>
        ))}
      </div>
      <div className={`mt-2 grid gap-1.5 ${tiles.length <= 6 ? "grid-cols-2" : "grid-cols-3"}`}>
        {tiles.map((p, i) => (
          <div key={p.name + i} className="relative overflow-hidden rounded-lg border border-stone-200/80 bg-white">
            <Thumb src={p.image} className="aspect-square w-full" />
            {cart[i] && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-[#1c1917] text-[8px] font-semibold text-white">
                {cart[i]}
              </span>
            )}
            <div className="px-1 py-1">
              <p className="truncate text-[7px] text-stone-600">{p.name}</p>
              <p className="text-[8px] font-semibold">GHS {p.price}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between rounded-full bg-[#1c1917] px-3.5 py-2.5 text-white">
        <span className="text-[8.5px] text-stone-300">{count} items</span>
        <span className="text-[10px] font-semibold">Charge {money(total)}</span>
      </div>
      <p className="mt-1.5 text-center text-[7.5px] text-stone-500">Cash · MoMo · Card · Bank — stock updates online</p>
    </>
  )
}

export function CashScreen({ items }: { items: ShotProduct[] }) {
  const lines = [
    { ...items[0], qty: 2 },
    { ...items[2], qty: 1 },
  ]
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const received = Math.ceil((total + 1) / 50) * 50
  return (
    <>
      <p className="text-[9px] text-stone-500">← Back to till</p>
      <p className="mt-1 font-display text-[20px] leading-tight">Take payment</p>
      <Card className="mt-2">
        {lines.map((l) => (
          <div key={l.name} className="flex items-center gap-2 py-1">
            <Thumb src={l.image} className="h-8 w-8 rounded-md" />
            <p className="min-w-0 flex-1 truncate text-[8.5px]">{l.name}</p>
            <span className="text-[8px] text-stone-500">× {l.qty}</span>
            <span className="w-14 text-right text-[8.5px]">{money(l.price * l.qty)}</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t border-stone-100 pt-1.5 text-[10px] font-semibold">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
      </Card>
      <Label>
        <span className="mt-2.5 block">Payment</span>
      </Label>
      <div className="mt-1 grid grid-cols-4 gap-1 text-center text-[8px] font-medium">
        {["Cash", "MoMo", "Card", "Bank"].map((m, i) => (
          <span
            key={m}
            className={`rounded-lg border py-1.5 ${i === 0 ? "border-[#1c1917] bg-[#1c1917] text-white" : "border-stone-200 bg-white"}`}
          >
            {m}
          </span>
        ))}
      </div>
      <Label>
        <span className="mt-2.5 block">Cash received</span>
      </Label>
      <div className="mt-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-[12px] font-semibold">{money(received)}</div>
      <div className="mt-1 flex gap-1 text-[7.5px]">
        {["Exact", "GHS 200", "GHS 500"].map((q) => (
          <span key={q} className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-stone-600">
            {q}
          </span>
        ))}
      </div>
      <div className="mt-2.5 rounded-xl bg-[#ecfdf5] p-2.5 text-center">
        <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#047857]">Change to give</p>
        <p className="mt-0.5 text-[18px] font-semibold text-[#047857]">{money(received - total)}</p>
      </div>
      <div className="mt-2.5 rounded-full bg-[#1c1917] py-2.5 text-center text-[10px] font-semibold text-white">Complete sale</div>
    </>
  )
}

export function ProductEditScreen({ product, extraPhotos }: { product: ShotProduct; extraPhotos: string[] }) {
  const photos = [product.image, ...extraPhotos].slice(0, 3)
  const field = (label: string, value: string) => (
    <div className="mt-2">
      <p className="text-[7.5px] text-stone-500">{label}</p>
      <div className="mt-0.5 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[9px]">{value}</div>
    </div>
  )
  return (
    <>
      <p className="text-[9px] text-stone-500">← Products</p>
      <p className="mt-1 font-display text-[20px] leading-tight">Edit product</p>
      <div className="mt-2 flex gap-1.5">
        {photos.map((src, i) => (
          <Thumb key={src + i} src={src} className="h-[58px] w-[44px] rounded-lg" />
        ))}
        <div className="grid h-[58px] w-[44px] place-items-center rounded-lg border border-dashed border-stone-300 bg-white text-center text-[7px] leading-tight text-stone-500">
          + Photo
          <br />
          or camera
        </div>
      </div>
      {field("Product name", product.name)}
      <div className="grid grid-cols-2 gap-1.5">
        {field("Price (GHS)", String(product.price))}
        {field("Old price (optional)", String(Math.round(product.price * 1.3)))}
      </div>
      {field("Stock", String(Math.max(product.stock, 6)))}
      <p className="mt-2 text-[7.5px] text-stone-500">Options</p>
      <div className="mt-0.5 flex gap-1 text-[8px]">
        {["Gold", "Silver", "Rose gold"].map((c) => (
          <span key={c} className="rounded-full border border-stone-200 bg-white px-2 py-0.5">
            {c}
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1 text-[8px] font-medium">
        <span className="rounded-full bg-[#1c1917] px-2.5 py-0.5 text-white">Active</span>
        <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-stone-600">Draft</span>
      </div>
      <div className="mt-3 rounded-full bg-[#1c1917] py-2.5 text-center text-[10px] font-semibold text-white">Save changes</div>
      <div className="mt-1.5 rounded-full border border-stone-300 py-2 text-center text-[9px] font-medium">
        Send product link on WhatsApp
      </div>
    </>
  )
}
