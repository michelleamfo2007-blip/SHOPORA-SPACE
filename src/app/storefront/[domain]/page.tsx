import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, MessageCircle, Smartphone, Truck, BadgeCheck } from "lucide-react"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { getStorefrontBasePath, whatsappLink } from "@/lib/storefront"
import { ProductCard } from "@/components/storefront/ProductCard"

export default async function StorefrontHomePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const store = await getStoreByHost(domain)

  if (!store) {
    notFound()
  }

  const basePath = await getStorefrontBasePath(domain)

  const [products, categories, reviews] = await Promise.all([
    db.product.findMany({
      where: { storeId: store.id, status: "ACTIVE", visibility: "VISIBLE" },
      include: { variants: { take: 2 } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.category.findMany({
      where: { storeId: store.id },
      include: {
        products: {
          where: { status: "ACTIVE", visibility: "VISIBLE" },
          select: { images: true, variants: { select: { imageUrl: true }, take: 1 } },
          take: 1,
        },
      },
      take: 6,
    }),
    db.review.findMany({
      where: { storeId: store.id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { customer: true },
    }),
  ])

  const collections = categories.filter((cat) => cat.products.length > 0)
  const headline = store.heroHeadline || store.name
  const subtext = store.heroSubtext || store.description
  const whatsappHref = store.whatsappNumber ? whatsappLink(store.whatsappNumber, `Hi ${store.name}, I'd like to place an order.`) : null
  const mosaicImages = products
    .map((p) => p.variants[0]?.imageUrl || p.images[0])
    .filter((img): img is string => !!img)
    .slice(0, 3)

  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link
        href={`${basePath}/products`}
        className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--store-accent)] px-7 text-sm tracking-wide text-white transition-opacity hover:opacity-90"
      >
        Shop the collection <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Link>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-stone-900 px-7 text-sm tracking-wide text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
        >
          Order on WhatsApp
        </a>
      )}
    </div>
  )

  return (
    <div>
      {store.heroImage ? (
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:gap-16 md:px-8 md:py-16">
          <div className="order-2 md:order-1">
            <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">Welcome to</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">{headline}</h1>
            {subtext && <p className="mt-6 max-w-md text-base leading-relaxed text-stone-600">{subtext}</p>}
            <div className="mt-10">{actions}</div>
          </div>
          <div className="order-1 md:order-2">
            {/* Banners are often posters with text in them, so they are shown whole rather than cropped. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.heroImage} alt={headline} className="mx-auto max-h-[75vh] w-full object-contain" />
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">Welcome to</p>
            <h1 className="mt-5 font-display text-6xl leading-[0.95] tracking-tight md:text-8xl">{headline}</h1>
            {subtext && <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-stone-600">{subtext}</p>}
            <div className="mt-10 flex justify-center">{actions}</div>
          </div>

          {mosaicImages.length === 3 && (
            <div className="mt-16 grid grid-cols-3 items-end gap-3 md:mt-20 md:gap-6">
              {mosaicImages.map((img, i) => (
                <div key={img} className={`overflow-hidden bg-[#efebe4] ${i === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-12 border-y border-stone-200 md:mt-16">
        <div className="mx-auto grid max-w-7xl divide-y divide-stone-200 px-5 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-8">
          {[
            { icon: Truck, title: "Delivered to your door", text: "The delivery fee is paid to the rider on arrival." },
            { icon: Smartphone, title: "Pay with ease", text: "Mobile Money or bank transfer at checkout." },
            whatsappHref
              ? { icon: MessageCircle, title: "Here to help", text: "Questions before you order? Message us on WhatsApp." }
              : { icon: BadgeCheck, title: "Personally confirmed", text: "Every order is checked by the seller before it ships." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 py-6 md:px-8 md:first:pl-0 md:last:pr-0">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-stone-700" strokeWidth={1.25} />
              <div>
                <p className="text-sm text-stone-900">{item.title}</p>
                <p className="mt-1 text-sm text-stone-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {collections.length > 1 && (
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">Browse</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Collections</h2>
            </div>
          </div>
          <div className="scrollbar-none -mx-5 flex snap-x gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {collections.map((cat) => {
              const cover = cat.products[0]?.variants[0]?.imageUrl || cat.products[0]?.images[0]
              return (
                <Link
                  key={cat.id}
                  href={`${basePath}/categories/${cat.slug}`}
                  className="group relative aspect-[4/5] w-[70vw] shrink-0 snap-start overflow-hidden bg-[#efebe4] md:w-auto"
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                    <h3 className="font-display text-3xl">{cat.name}</h3>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={1.25} />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section id="shop" className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">Just in</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">New arrivals</h2>
          </div>
          {products.length > 0 && (
            <Link href={`${basePath}/products`} className="group hidden items-center gap-2 text-sm text-stone-900 sm:flex">
              <span className="border-b border-stone-900 pb-0.5">View all</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} currency={store.currency} basePath={basePath} />
              ))}
            </div>
            <div className="mt-12 text-center sm:hidden">
              <Link href={`${basePath}/products`} className="inline-flex h-12 items-center rounded-full border border-stone-900 px-8 text-sm tracking-wide">
                View all products
              </Link>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-stone-300 px-6 py-20 text-center">
            <p className="font-display text-3xl">New pieces are on their way</p>
            <p className="mt-3 text-sm text-stone-500">Check back soon to see what {store.name} has in store.</p>
          </div>
        )}
      </section>

      {store.aboutText && (
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <div className="grid gap-8 border-t border-stone-200 pt-12 md:grid-cols-[1fr_2fr] md:gap-16 md:pt-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">About</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Our story</h2>
            </div>
            <p className="font-display text-2xl leading-snug text-stone-700 md:text-3xl">{store.aboutText}</p>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <div className="mb-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">Reviews</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Kind words</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <figure key={review.id} className="flex flex-col bg-[#f3efe8] p-8">
                <div className="flex gap-0.5 text-[var(--store-accent)]" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current" : "fill-stone-300"}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-6 flex-1 font-display text-2xl italic leading-snug text-stone-800">&ldquo;{review.comment}&rdquo;</blockquote>
                <figcaption className="mt-8 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  {review.customer?.name || "Verified customer"}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {whatsappHref && (
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <div className="bg-stone-900 px-6 py-16 text-center text-white md:py-20">
            <h2 className="font-display text-4xl md:text-5xl">Need help choosing?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/70">Send us a message and we&apos;ll help you find the right piece, check sizes, or arrange delivery.</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm tracking-wide text-stone-900 transition-opacity hover:opacity-90"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
