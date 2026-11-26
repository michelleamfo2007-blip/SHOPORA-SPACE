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
      where: { storeId: store.id, status: { not: "HIDDEN" }, comment: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { customer: true },
    }),
  ])

  const collections = categories.filter((cat) => cat.products.length > 0)
  const ribbon = [
    `Welcome to ${store.name}`,
    ...collections.map((cat) => cat.name),
    "Delivery fee paid on arrival",
    "Pay with Mobile Money or bank transfer",
    store.whatsappNumber ? "Order easily on WhatsApp" : "Every order personally confirmed",
  ]
  const headline = store.heroHeadline || store.name
  const subtext =
    store.heroSubtext ||
    store.description ||
    (store.shoporaDeliveryEnabled
      ? "Shop online, pay with Mobile Money or bank transfer, and get it delivered across Accra."
      : "Shop online and pay with Mobile Money or bank transfer.")
  const whatsappHref = store.whatsappNumber ? whatsappLink(store.whatsappNumber, `Hi ${store.name}, I'd like to place an order.`) : null
  const coverTiles = products
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.variants[0]?.imageUrl || p.images[0],
    }))
    .filter((p): p is typeof p & { image: string } => !!p.image)
    .slice(0, 3)

  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link href={`${basePath}/products`} className="store-btn gap-2">
        Shop the collection <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
      </Link>
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="store-btn-ghost">
          Order on WhatsApp
        </a>
      )}
    </div>
  )

  return (
    <div>
      {store.heroImage ? (
        <section className="relative">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-10 pt-8 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:pb-20 md:pt-14">
            <div className="order-2 md:order-1">
              <p className="store-kicker">The house of</p>
              <h1 className="mt-5 font-display text-5xl leading-[0.9] tracking-tight md:mt-6 md:text-7xl lg:text-[5.75rem]">{headline}</h1>
              <div className="store-rule mt-7 w-20" />
              {subtext && <p className="mt-6 max-w-md font-display text-xl italic leading-relaxed text-[var(--store-muted)] md:mt-7 md:text-2xl">{subtext}</p>}
              <div className="mt-8 md:mt-12">{actions}</div>
            </div>
            <div className="order-1 md:order-2">
              <div className="border border-[var(--store-line)] bg-[#efe8dc] p-2 md:p-3">
                {/* Banners are often posters with text in them, so they are shown whole rather than cropped. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={store.heroImage} alt={headline} className="mx-auto h-auto max-h-[46vh] w-auto max-w-full object-contain md:max-h-[78vh] md:w-full" />
              </div>
            </div>
          </div>
        </section>
      ) : coverTiles.length > 0 ? (
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-10 pt-8 md:grid-cols-[0.9fr_1.2fr] md:gap-14 md:px-8 md:pb-20 md:pt-14">
          <div className="order-2 md:order-1">
            <p className="store-kicker">{store.heroHeadline ? store.name : "The house of"}</p>
            <h1 className="mt-5 font-display text-5xl leading-[0.9] tracking-tight md:mt-6 md:text-7xl lg:text-[5.75rem]">{headline}</h1>
            <div className="store-rule mt-7 w-20" />
            <p className="mt-6 max-w-md font-display text-xl italic leading-relaxed text-[var(--store-muted)] md:mt-7 md:text-2xl">{subtext}</p>
            <div className="mt-8 md:mt-12">{actions}</div>
          </div>
          <div
            className={`order-1 grid h-[78vw] max-h-[660px] gap-2.5 md:order-2 md:h-[min(72vh,660px)] md:gap-4 ${
              coverTiles.length === 3 ? "grid-cols-[1.4fr_1fr] grid-rows-2" : coverTiles.length === 2 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {coverTiles.map((tile, i) => (
              <Link
                key={tile.id}
                href={`${basePath}/product/${tile.id}`}
                className={`group relative overflow-hidden bg-[#efe8dc] ring-1 ring-[var(--store-line)] ${coverTiles.length === 3 && i === 0 ? "row-span-2" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.image}
                  alt={tile.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="store-kicker">The house of</p>
            <h1 className="mt-5 font-display text-5xl leading-[0.9] tracking-tight md:mt-6 md:text-8xl">{headline}</h1>
            <div className="store-rule mx-auto mt-7 w-20" />
            <p className="mx-auto mt-6 max-w-lg font-display text-xl italic leading-relaxed text-[var(--store-muted)] md:mt-7 md:text-2xl">{subtext}</p>
            <div className="mt-8 flex justify-center md:mt-10">{actions}</div>
          </div>
        </section>
      )}

      <section className="mt-10 overflow-hidden border-y border-[var(--store-line)] py-5 md:mt-16 md:py-7" aria-label={`About ${store.name}`}>
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {ribbon.map((text, i) => (
                <span key={i} className="flex items-center whitespace-nowrap font-display text-2xl italic text-[var(--store-ink)] md:text-3xl">
                  <span className="px-6 md:px-10">{text}</span>
                  <span className="text-base not-italic text-[var(--store-gold)]">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {collections.length > 1 && (
        <section className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-28">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="store-kicker">Browse</p>
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
                  className="group relative aspect-[4/5] w-[70vw] shrink-0 snap-start overflow-hidden bg-[#efe8dc] ring-1 ring-[var(--store-line)] md:w-auto"
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

      <section id="shop" className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
              <p className="store-kicker">The collection</p>
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
              <Link href={`${basePath}/products`} className="store-btn-ghost">
                View all products
              </Link>
            </div>
          </>
        ) : (
          <div className="border border-[var(--store-line)] px-6 py-20 text-center">
            <p className="font-display text-3xl">New pieces are on their way</p>
            <p className="mt-3 text-sm text-[var(--store-muted)]">Check back soon to see what {store.name} has in store.</p>
          </div>
        )}
      </section>

      <section className="mt-16 border-y border-[var(--store-line)] md:mt-28">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-[var(--store-line)] md:px-8">
          {[
            { icon: Truck, title: "Delivered to your door", short: "Delivery to your door", text: "The delivery fee is paid to the rider on arrival." },
            { icon: Smartphone, title: "Pay with ease", short: "MoMo or bank transfer", text: "Mobile Money or bank transfer at checkout." },
            whatsappHref
              ? { icon: MessageCircle, title: "Here to help", short: "Help on WhatsApp", text: "Questions before you order? Message us on WhatsApp." }
              : { icon: BadgeCheck, title: "Personally confirmed", short: "Checked by the seller", text: "Every order is checked by the seller before it ships." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-2 px-2 py-5 text-center md:flex-row md:items-start md:gap-4 md:px-8 md:py-6 md:text-left md:first:pl-0 md:last:pr-0">
              <item.icon className="h-5 w-5 shrink-0 text-[var(--store-gold)] md:mt-0.5" strokeWidth={1.25} />
              <p className="text-xs leading-snug text-[var(--store-muted)] md:hidden">{item.short}</p>
              <div className="hidden md:block">
                <p className="text-sm text-[var(--store-ink)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--store-muted)]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {store.aboutText && (
        <section className="mt-20 bg-[#1c1917] text-[#f7f3ec] md:mt-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_2fr] md:gap-20 md:px-8 md:py-24">
            <div>
              <p className="store-kicker !text-[#c8a165]">The house</p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl">Our story</h2>
            </div>
            <p className="font-display text-2xl italic leading-snug text-white/75 md:text-3xl">{store.aboutText}</p>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <div className="mb-10 text-center">
            <p className="store-kicker">Reviews</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Kind words</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <figure key={review.id} className="flex flex-col border border-[var(--store-line)] bg-white/40 p-8">
                <div className="flex gap-0.5 text-[var(--store-gold)]" aria-label={`${review.rating} out of 5 stars`}>
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
          <div className="border border-[var(--store-ink)] bg-[var(--store-ink)] px-6 py-16 text-center text-[#f7f3ec] md:py-20">
            <p className="store-kicker !text-[#c8a165]">Private appointment</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Need help choosing?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/70">Send us a message and we&apos;ll help you find the right piece, check sizes, or arrange delivery.</p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="store-btn mt-8 !border-[#f7f3ec] !bg-[#f7f3ec] !text-[var(--store-ink)] hover:!bg-[#c8a165] hover:!border-[#c8a165] hover:!text-[#1c1917]">
              Chat on WhatsApp
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
