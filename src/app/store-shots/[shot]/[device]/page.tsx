import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Phone, RiderScreen, SellerHomeScreen } from "@/components/marketing/mockups"
import {
  CashScreen,
  LockScreen,
  ProductEditScreen,
  TillScreen,
  VerifyOrderScreen,
  type ShotProduct,
} from "./screens"

/**
 * App Store and Google Play screenshots, captured with a headless browser.
 * Local only: /store-shots/home/ios, /store-shots/till/android, /store-shots/feature/android
 */

const DEVICES = {
  ios: { width: 430, scale: 1.36, pad: 64, gap: 28, eyebrow: 11, title: 40, sub: 15 },
  android: { width: 540, scale: 1.38, pad: 56, gap: 26, eyebrow: 13, title: 44, sub: 17 },
} as const

type Shot = { dark: boolean; title: string; sub: string; screen: (p: ShotProduct[]) => ReactNode; lock?: boolean }

const SHOTS: Record<string, Shot> = {
  home: {
    dark: true,
    title: "Your whole shop, in your pocket.",
    sub: "Sales, orders and stock at a glance.",
    screen: () => <SellerHomeScreen withAlert={false} storeName="Shimmer Jewels" />,
  },
  alerts: {
    dark: false,
    title: "Never miss an order.",
    sub: "An alert for every sale, right on your lock screen.",
    screen: (p) => <LockScreen wallpaper={p[0].image} />,
    lock: true,
  },
  verify: {
    dark: true,
    title: "Check MoMo payments in one tap.",
    sub: "Customers pay you directly. Shopora takes 0%.",
    screen: (p) => <VerifyOrderScreen items={p} />,
  },
  till: {
    dark: false,
    title: "Sell in your shop too.",
    sub: "The shop till updates your online stock.",
    screen: (p) => <TillScreen items={p} />,
  },
  cash: {
    dark: true,
    title: "Cash, MoMo, card or bank.",
    sub: "Change worked out for you. Receipts on WhatsApp.",
    screen: (p) => <CashScreen items={p} />,
  },
  product: {
    dark: false,
    title: "Add products from your camera.",
    sub: "Photos, prices, sizes and colours in seconds.",
    screen: (p) => <ProductEditScreen product={p[0]} extraPhotos={[p[1].image, p[2].image]} />,
  },
  rider: {
    dark: true,
    title: "Delivery across Accra.",
    sub: "Shopora riders deliver to your customer's exact pin.",
    screen: () => <RiderScreen />,
  },
}

async function shimmerProducts(): Promise<ShotProduct[]> {
  const products = await db.product.findMany({
    where: { store: { slug: "shimmerjewels" }, status: "ACTIVE", price: { not: null }, images: { isEmpty: false } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 9,
    select: { name: true, price: true, images: true, stockCount: true },
  })
  return products.map((p) => ({
    name: p.name,
    price: Number(p.price),
    image: p.images[0],
    images: p.images,
    stock: p.stockCount,
  }))
}

function ScaledPhone({ scale, children, lock }: { scale: number; children: ReactNode; lock?: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: 236 * scale, height: 498 * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
        <Phone className="!shadow-none ring-1 ring-white/15" screenClassName={lock ? "bg-[#12100e]" : undefined}>
          {children}
        </Phone>
      </div>
    </div>
  )
}

const HIDE_OVERLAYS = "body > div.fixed{display:none!important}nextjs-portal{display:none!important}"

export default async function StoreShotsPage({ params }: { params: Promise<{ shot: string; device: string }> }) {
  if (process.env.NODE_ENV === "production") notFound()
  const { shot, device } = await params
  const products = await shimmerProducts()

  if (shot === "feature") {
    return (
      <main className="relative flex h-screen w-screen overflow-hidden bg-[#12100e] text-white">
        <style>{HIDE_OVERLAYS}</style>
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#c8a165]/10 blur-3xl" />
        <div className="relative z-10 flex w-[54%] flex-col justify-center pl-16">
          <p className="font-display text-[34px] leading-none">
            Shopora<span className="text-[#c8a165]">.</span>
          </p>
          <h1 className="mt-6 font-display text-[50px] leading-[1.02]">
            Your shop,
            <br />
            beautifully run.
          </h1>
          <p className="mt-4 text-[17px] text-stone-300">Online store, seller app, shop till and Accra delivery.</p>
        </div>
        <div className="relative flex-1">
          <div className="absolute left-6 top-14 -rotate-6">
            <ScaledPhone scale={0.95}>
              <SellerHomeScreen withAlert storeName="Shimmer Jewels" />
            </ScaledPhone>
          </div>
          <div className="absolute left-[230px] top-24 rotate-3">
            <ScaledPhone scale={0.95}>
              <TillScreen items={products} />
            </ScaledPhone>
          </div>
        </div>
      </main>
    )
  }

  const config = SHOTS[shot]
  const d = DEVICES[device === "android" ? "android" : "ios"]
  if (!config || products.length < 3) notFound()

  return (
    <main
      className={`flex h-screen w-screen flex-col items-center overflow-hidden ${
        config.dark ? "bg-[#12100e] text-white" : "bg-[#f6f2ea] text-[#1c1917]"
      }`}
      style={{ paddingTop: d.pad }}
    >
      <style>{HIDE_OVERLAYS}</style>
      <p
        className={`uppercase tracking-[0.32em] ${config.dark ? "text-[#c8a165]" : "text-[#8a6a3d]"}`}
        style={{ fontSize: d.eyebrow }}
      >
        Shopora
      </p>
      <h1
        className="mt-2.5 text-center font-display leading-[1.04]"
        style={{ fontSize: d.title, maxWidth: d.width * 0.86, textWrap: "balance" }}
      >
        {config.title}
      </h1>
      <p
        className={`mt-2.5 text-center leading-snug ${config.dark ? "text-stone-300" : "text-stone-600"}`}
        style={{ fontSize: d.sub, maxWidth: d.width * 0.8, textWrap: "balance" }}
      >
        {config.sub}
      </p>
      <div style={{ marginTop: d.gap }}>
        <ScaledPhone scale={d.scale} lock={config.lock}>
          {config.screen(products)}
        </ScaledPhone>
      </div>
    </main>
  )
}
