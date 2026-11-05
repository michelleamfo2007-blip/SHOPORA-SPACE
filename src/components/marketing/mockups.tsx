import type { ReactNode } from "react"

/** Device frames and screens drawn in CSS so the landing page mockups stay crisp and on-brand. */

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-[236px] shrink-0 rounded-[2.6rem] bg-[#12100e] p-[9px] shadow-[0_50px_100px_-40px_rgba(18,16,14,0.65),inset_0_0_0_1px_rgba(255,255,255,0.08)] ${className}`}
    >
      <div className="absolute left-1/2 top-[18px] z-10 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-[#12100e]" />
      <div className="h-[480px] overflow-hidden rounded-[2.05rem] bg-[#faf8f5] px-4 pb-3 pt-11 text-[#1c1917]">
        {children}
      </div>
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[7.5px] uppercase tracking-[0.2em] text-stone-500">{children}</p>
}

export function SellerHomeScreen({ withAlert = true, storeName }: { withAlert?: boolean; storeName?: string }) {
  return (
    <>
      {withAlert && (
        <div className="mb-3 rounded-2xl bg-[#1c1917]/95 px-3 py-2.5 text-white shadow-xl">
          <p className="text-[7px] uppercase tracking-[0.18em] text-stone-400">Shopora · now</p>
          <p className="mt-0.5 text-[10px] font-semibold">New order · GHS 240.00</p>
          <p className="text-[9px] text-stone-300">Ama placed ORD-482193. Verify the payment.</p>
        </div>
      )}
      <Label>{storeName ?? "Atelier Accra"}</Label>
      <p className="mt-0.5 font-display text-[22px] leading-none">{storeName ? "Welcome back" : "Hi Akosua"}</p>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          ["Revenue", "GHS 8,420"],
          ["Orders", "64"],
          ["Products", "38"],
          ["Store views", "1,902"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-200/80 bg-white p-2">
            <Label>{label}</Label>
            <p className="mt-1 text-[12px] font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-1.5 rounded-xl border border-stone-200/80 bg-white p-2">
        <Label>Sales · last 7 days</Label>
        <div className="mt-2 flex h-[60px] items-end gap-1">
          {[34, 52, 40, 78, 58, 96, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-[3px] bg-[#1c1917]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between rounded-xl border border-stone-200/80 bg-white px-2.5 py-2 text-center">
        {[
          ["3", "To verify"],
          ["5", "Processing"],
          ["2", "Shipped"],
          ["54", "Delivered"],
        ].map(([n, l], i) => (
          <div key={l}>
            <p className={`text-[12px] font-semibold ${i === 0 ? "text-[#b45309]" : ""}`}>{n}</p>
            <p className="text-[7px] text-stone-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-around border-t border-stone-200 pt-2 text-[7.5px] text-stone-400">
        {["Home", "Orders", "Products", "More"].map((t, i) => (
          <span key={t} className={i === 0 ? "font-semibold text-[#1c1917]" : ""}>
            {t}
          </span>
        ))}
      </div>
    </>
  )
}

export function VerifyScreen() {
  return (
    <>
      <p className="text-[9px] text-stone-500">← Orders</p>
      <p className="mt-1 font-display text-[20px] leading-tight">Order #ORD-482193</p>
      <span className="mt-1 inline-block rounded-full bg-[#fef3c7] px-2 py-0.5 text-[8px] font-semibold text-[#b45309]">
        Verify payment
      </span>
      <div className="mt-2.5 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-2.5 text-[9px] leading-snug">
        <p className="font-semibold">Payment to check</p>
        <p className="text-stone-700">MTN MoMo reference 0541234567</p>
        <p className="text-stone-500">Expected GHS 240.00</p>
      </div>
      <div className="mt-1.5 rounded-xl border border-stone-200/80 bg-white p-2.5">
        <Label>Items</Label>
        {[
          ["Kente print shirt", "M / Gold", "180.00", "from-[#e7c77d] to-[#a8742e]"],
          ["Beaded bracelet", "One size", "60.00", "from-[#d8b4a0] to-[#8c5a44]"],
        ].map(([n, v, p, g]) => (
          <div key={n} className="mt-2 flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${g}`} />
            <div className="flex-1">
              <p className="text-[9px] font-medium">{n}</p>
              <p className="text-[8px] text-stone-500">{v}</p>
            </div>
            <p className="text-[9px]">GHS {p}</p>
          </div>
        ))}
      </div>
      <div className="mt-1.5 rounded-xl border border-stone-200/80 bg-white p-2.5 text-[9px]">
        <Label>Delivery</Label>
        <p className="mt-1 font-semibold">Shopora Delivery · Accra</p>
        <p className="text-stone-500">East Legon, blue gate opposite Total</p>
        <p className="mt-1 font-medium text-[#047857]">Exact pin saved</p>
      </div>
      <div className="mt-3 rounded-full bg-[#1c1917] py-2.5 text-center text-[10px] font-semibold text-white">
        Verify payment
      </div>
    </>
  )
}

export function RiderScreen() {
  return (
    <>
      <Label>Shopora riders · Accra</Label>
      <p className="mt-0.5 font-display text-[20px] leading-tight">Kwame Mensah</p>
      <div className="mt-2 rounded-2xl bg-[#047857] px-3 py-2.5 text-white">
        <p className="text-[12px] font-semibold">You’re online</p>
        <p className="text-[8px] text-emerald-100">New Accra jobs appear here</p>
      </div>
      <div className="mt-2.5 rounded-xl border border-stone-200/80 bg-white p-2.5">
        <div className="flex justify-between">
          <div>
            <p className="text-[10px] font-semibold">Atelier Accra</p>
            <p className="text-[8px] text-stone-500">#ORD-482193</p>
          </div>
          <p className="text-[11px] font-bold">GHS 32.00</p>
        </div>
        <p className="mt-1.5 text-[8px] text-stone-600">
          <span className="text-stone-400">PICKUP</span> Osu, Oxford Street
        </p>
        <p className="text-[8px] text-stone-600">
          <span className="text-stone-400">DROPOFF</span> East Legon
        </p>
        <div className="relative mt-2 h-[104px] overflow-hidden rounded-lg bg-[#e9eee4]">
          <svg viewBox="0 0 200 104" className="absolute inset-0 h-full w-full">
            <path d="M0 74 L60 58 L112 66 L200 30" stroke="#fff" strokeWidth="7" fill="none" />
            <path d="M42 0 L56 104" stroke="#fff" strokeWidth="5" fill="none" />
            <path d="M132 0 L150 104" stroke="#fff" strokeWidth="5" fill="none" />
            <path d="M48 60 Q102 40 152 38" stroke="#1c1917" strokeWidth="2" strokeDasharray="4 3" fill="none" />
          </svg>
          <span className="absolute left-6 top-12 rounded-full bg-[#1c1917] px-1.5 py-0.5 text-[7px] font-semibold text-white">
            Pickup
          </span>
          <span className="absolute right-6 top-5 rounded-full bg-[#b45309] px-1.5 py-0.5 text-[7px] font-semibold text-white">
            Customer
          </span>
        </div>
        <p className="mt-1.5 text-[8px] text-stone-500">7.2 km · ~22 mins · You keep GHS 27.20</p>
        <div className="mt-1.5 rounded-full bg-[#1c1917] py-2 text-center text-[9px] font-semibold text-white">
          Navigate to customer
        </div>
      </div>
      <div className="mt-1.5 rounded-xl border border-stone-200/80 bg-white p-2.5">
        <p className="text-[7.5px] uppercase tracking-[0.18em] text-stone-500">Customer’s delivery code</p>
        <p className="mt-1 text-center text-[17px] font-semibold tracking-[0.45em]">482193</p>
      </div>
    </>
  )
}

const products = [
  { name: "Kente print shirt", price: "GHS 180", g: "from-[#e9cf8f] via-[#c99a4b] to-[#8a5a22]" },
  { name: "Linen two-piece", price: "GHS 420", g: "from-[#e8ddd0] via-[#c9b49c] to-[#8f7660]" },
  { name: "Beaded bracelet", price: "GHS 60", g: "from-[#e5c2ae] via-[#bf8c73] to-[#7f4f3b]" },
]

/** A live Shopora store, shown inside the landing page browser mockup. */
export type FeaturedStorefront = {
  name: string
  domain: string
  announcement: string | null
  headline: string
  subtext: string | null
  heroImage: string
  products: { name: string; price: string; image: string }[]
}

/** A seller's storefront as customers see it, in a browser window. */
export function BrowserStorefront({ store }: { store?: FeaturedStorefront | null }) {
  const items = store
    ? store.products.map((p) => ({ ...p, g: "from-stone-200 to-stone-300" }))
    : products.map((p) => ({ ...p, image: null }))

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_60px_120px_-50px_rgba(18,16,14,0.5)] ring-1 ring-stone-900/10">
      <div className="flex items-center gap-2 border-b border-stone-100 bg-[#f4f1ec] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-stone-500">
          {store?.domain ?? "atelier.shopora.space"}
        </span>
      </div>
      <div className="bg-[#faf8f5]">
        {(!store || store.announcement) && (
          <div className="truncate bg-[#1c1917] px-6 py-1.5 text-center text-[8px] uppercase tracking-[0.25em] text-white">
            {store ? store.announcement : "Free Accra delivery this weekend"}
          </div>
        )}
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <span className="text-[8px] uppercase tracking-[0.2em] text-stone-500">Shop · Collections</span>
          <span className="truncate font-display text-xl">{store?.name ?? "Atelier"}</span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-stone-500">Bag (2)</span>
        </div>
        <div className="grid grid-cols-[1.1fr_1fr] items-center gap-5 px-6 pb-5">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.25em] text-stone-500">New season</p>
            {store ? (
              <>
                <p className="mt-1.5 line-clamp-3 font-display text-[34px] leading-[0.95]">{store.headline}</p>
                {store.subtext && (
                  <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-stone-500">{store.subtext}</p>
                )}
              </>
            ) : (
              <p className="mt-1.5 font-display text-[34px] leading-[0.95]">
                Made in Accra,
                <br />
                <span className="italic">worn everywhere.</span>
              </p>
            )}
            <span className="mt-3 inline-block rounded-full bg-[#1c1917] px-4 py-1.5 text-[9px] text-white">
              Shop the collection
            </span>
          </div>
          {store ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.heroImage} alt="" className="aspect-[4/5] w-full rounded-sm bg-stone-200 object-cover" />
          ) : (
            <div className="aspect-[4/5] rounded-sm bg-gradient-to-br from-[#d8c3a3] via-[#b08a5f] to-[#5e4329]" />
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-stone-200/70 px-6 py-4">
          {items.map((p) => (
            <div key={p.name} className="min-w-0">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="aspect-[3/4] w-full rounded-sm bg-stone-200 object-cover" />
              ) : (
                <div className={`aspect-[3/4] rounded-sm bg-gradient-to-br ${p.g}`} />
              )}
              <p className="mt-1.5 truncate text-[9px] text-stone-800">{p.name}</p>
              <p className="text-[9px] text-stone-500">{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M16.37 12.55c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.84.86-3.6 2.18-1.54 2.67-.39 6.6 1.1 8.77.74 1.06 1.6 2.25 2.73 2.2 1.1-.04 1.51-.7 2.84-.7 1.32 0 1.7.7 2.86.68 1.18-.02 1.93-1.07 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.5zM14.2 6.07c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.3-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.2z" />
    </svg>
  )
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4.5 3.2 13.6 12l-9.1 8.8c-.3-.2-.5-.6-.5-1V4.2c0-.4.2-.8.5-1z" fill="#34d399" />
      <path d="M16.6 9.1 13.6 12l-9.1-8.8c.1-.1.3-.1.4-.1.2 0 .4 0 .6.1l11.1 5.9z" fill="#60a5fa" />
      <path d="M16.6 14.9 5.5 20.8c-.2.1-.4.1-.6.1-.1 0-.3 0-.4-.1l9.1-8.8 3 2.9z" fill="#f87171" />
      <path d="m20.1 11.1-3.5-2-3 2.9 3 2.9 3.5-1.9c.7-.4.7-1.5 0-1.9z" fill="#fbbf24" />
    </svg>
  )
}

/** "Coming soon" store badges (the app is not published yet). */
export function StoreBadges({ dark = false }: { dark?: boolean }) {
  const base = dark
    ? "border-white/15 bg-white/5 text-white"
    : "border-stone-900/15 bg-white text-stone-950"
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { glyph: <AppleGlyph />, top: "Coming soon to the", store: "App Store" },
        { glyph: <PlayGlyph />, top: "Coming soon on", store: "Google Play" },
      ].map((b) => (
        <div key={b.store} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${base}`}>
          {b.glyph}
          <div className="leading-tight">
            <p className={`text-[10px] ${dark ? "text-stone-400" : "text-stone-500"}`}>{b.top}</p>
            <p className="text-[15px] font-semibold tracking-tight">{b.store}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
