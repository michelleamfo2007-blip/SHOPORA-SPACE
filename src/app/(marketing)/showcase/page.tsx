import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { db } from "@/lib/db"
import { isSubscriptionLapsed } from "@/lib/subscription"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export const revalidate = 300

/** Hidden until there are enough finished stores to show off. Set to true to bring the page back. */
const SHOWCASE_ENABLED = false

const visibleWithPhotos = { status: "ACTIVE", visibility: "VISIBLE", images: { isEmpty: false } } as const

export default async function ShowcasePage() {
  if (!SHOWCASE_ENABLED) redirect("/")

  const stores = await db.store.findMany({
    where: { status: "ACTIVE", products: { some: visibleWithPhotos } },
    orderBy: { createdAt: "desc" },
    take: 36,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      heroSubtext: true,
      logoUrl: true,
      subscription: { select: { status: true, currentPeriodEnd: true } },
      products: {
        where: visibleWithPhotos,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: { images: true },
      },
      _count: { select: { products: { where: { status: "ACTIVE", visibility: "VISIBLE" } } } },
    },
  })

  const live = stores
    .filter((store) => !isSubscriptionLapsed(store.subscription))
    .sort((a, b) => Math.min(b.products.length, 3) - Math.min(a.products.length, 3))

  return (
    <div className="min-h-screen bg-[#f6f2ea] text-[#12100e] lining-nums selection:bg-[#12100e] selection:text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:pt-40">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">Showcase</p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-[-0.02em] md:text-7xl">
            Shops <span className="italic text-[#8a6a3d]">made</span> on Shopora.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-stone-600 md:text-lg">
            Real Ghanaian brands selling on their own Shopora storefronts. Open one to see it live.
          </p>
        </div>

        {live.length === 0 ? (
          <div className="mt-16 border border-dashed border-stone-300 px-6 py-20 text-center text-stone-500">
            The first shops are setting up. Check back soon.
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
            {live.map((store) => {
              const photos = store.products.map((p) => p.images[0]).filter(Boolean)
              const blurb = store.description || store.heroSubtext
              return (
                <a
                  key={store.id}
                  href={`https://${store.slug}.shopora.space`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div
                    className={`grid aspect-[4/5] gap-1.5 overflow-hidden bg-[#ebe5da] ${
                      photos.length >= 3 ? "grid-cols-[1.5fr_1fr] grid-rows-2" : photos.length === 2 ? "grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {photos.slice(0, 3).map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        className={`overflow-hidden ${photos.length >= 3 && i === 0 ? "row-span-2" : ""}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-start gap-3">
                    {store.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={store.logoUrl}
                        alt=""
                        className="mt-1 h-9 w-9 shrink-0 rounded-full bg-white object-cover ring-1 ring-stone-900/10"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-display text-[28px] leading-tight">{store.name}</h2>
                        <ArrowUpRight
                          className="mt-2 h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-stone-900"
                          strokeWidth={1.5}
                        />
                      </div>
                      {blurb && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-600">{blurb}</p>}
                      <p className="mt-2 text-xs text-stone-500">
                        {store._count.products} {store._count.products === 1 ? "product" : "products"} · {store.slug}.shopora.space
                      </p>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-stone-900/10 pt-12 md:flex-row md:items-center">
          <p className="font-display text-3xl md:text-4xl">
            Your shop could be <span className="italic text-[#8a6a3d]">next.</span>
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#12100e] px-7 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Start your free month <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
