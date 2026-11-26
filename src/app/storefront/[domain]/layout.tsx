import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { DM_Sans } from "next/font/google"
import { Search } from "lucide-react"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { isSubscriptionLapsed } from "@/lib/subscription"
import { getStoreAccent, getStorefrontBasePath, whatsappLink } from "@/lib/storefront"
import { CartDrawer } from "@/components/storefront/CartDrawer"
import { MobileMenu } from "@/components/storefront/MobileMenu"
import { SocialIcons } from "@/components/storefront/SocialIcons"
import { StoreAnalyticsTracker } from "@/components/storefront/StoreAnalyticsTracker"

// Cormorant display font is loaded once in the root layout (--font-store-display).
// Loading it again here breaks Turbopack / Vercel builds ("next/font/google queries have exactly one entry").
const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-store-sans",
})

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params
  const store = await getStoreByHost(domain)
  if (!store) return {}

  const description = store.description || store.heroSubtext || `Shop ${store.name} online.`
  const image = store.heroImage || store.logoUrl

  return {
    title: { default: store.name, template: `%s · ${store.name}` },
    description,
    openGraph: {
      title: store.name,
      description,
      siteName: store.name,
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params
  const store = await getStoreByHost(domain)

  if (!store) {
    notFound()
  }

  const accent = getStoreAccent(store.primaryColor)
  const themeStyle = { "--store-accent": accent } as React.CSSProperties
  const fontClasses = `${sans.variable} font-store`
  const whatsappHref = store.whatsappNumber ? whatsappLink(store.whatsappNumber) : null

  if (isSubscriptionLapsed(store.subscription)) {
    return (
      <div className={`store-atelier ${fontClasses} flex min-h-screen flex-col items-center justify-center px-6 text-center`}>
        {store.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.logoUrl} alt={`${store.name} Logo`} className="mb-8 h-16 w-auto object-contain" />
        )}
        <p className="store-kicker">Temporarily closed</p>
        <h1 className="mt-4 font-display text-5xl">{store.name}</h1>
        <div className="store-rule mx-auto mt-6 w-24" />
        <p className="mt-6 max-w-sm text-[var(--store-muted)]">This store is closed for now. Please check back soon.</p>
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="store-btn-ghost mt-8">
            Message the seller on WhatsApp
          </a>
        )}
      </div>
    )
  }

  const basePath = await getStorefrontBasePath(domain)
  const hasCategories =
    (await db.category.count({
      where: { storeId: store.id, products: { some: { status: "ACTIVE", visibility: "VISIBLE" } } },
    })) > 0

  const navLinks = [
    { href: `${basePath}/`, label: "Home" },
    { href: `${basePath}/products`, label: "Shop" },
    ...(hasCategories ? [{ href: `${basePath}/categories`, label: "Collections" }] : []),
    { href: `${basePath}/pages/shipping`, label: "Delivery" },
  ]

  return (
    <div className={`store-atelier ${fontClasses} flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-clip`} style={themeStyle}>
      {store.announcementText && (
        <div className="bg-[var(--store-gold)] px-4 py-1.5 text-center text-[10px] tracking-[0.14em] text-[#f7f3ec]">
          <p className="mx-auto line-clamp-1 max-w-5xl">{store.announcementText}</p>
        </div>
      )}

      {/* Solid paper so product photos never show through. No backdrop-filter: it would trap the bag panel. */}
      <header className="sticky top-0 z-40 border-b border-[var(--store-line)] bg-[#f7f3ec]">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 md:h-[5.25rem] md:px-8">
          <div className="flex items-center">
            <MobileMenu storeName={store.name} basePath={basePath} hasCategories={hasCategories} whatsappHref={whatsappHref} />
            <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-[11px] uppercase tracking-[0.22em] text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href={`${basePath}/`} className="flex min-w-0 items-center gap-3 justify-self-center md:gap-4">
            {store.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt="" className="h-9 w-9 shrink-0 object-cover ring-1 ring-[var(--store-line)] md:h-12 md:w-12" />
            )}
            <span className="max-w-[40vw] truncate font-display text-[1.45rem] italic leading-none tracking-tight md:max-w-none md:text-[2.15rem]">
              {store.name}
            </span>
          </Link>

          <div className="flex items-center justify-end md:gap-4">
            <Link href={`${basePath}/products?search=1`} aria-label="Search products" className="flex h-10 w-10 items-center justify-center text-stone-900">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <CartDrawer currency={store.currency} basePath={basePath} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t-2 border-[var(--store-gold)] bg-[#1c1917] text-[#f7f3ec]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:px-8 md:py-20">
          <div>
            <p className="store-kicker">The house of</p>
            <p className="mt-3 font-display text-4xl italic">{store.name}</p>
            {store.description && <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{store.description}</p>}
            <div className="mt-8">
              <SocialIcons store={store} />
            </div>
          </div>

          <div>
            <p className="store-kicker">Shop</p>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li><Link href={`${basePath}/products`} className="hover:text-[var(--store-gold)]">The collection</Link></li>
              {hasCategories && <li><Link href={`${basePath}/categories`} className="hover:text-[var(--store-gold)]">Collections</Link></li>}
              {whatsappHref && <li><a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-[var(--store-gold)]">Order on WhatsApp</a></li>}
            </ul>
          </div>

          <div>
            <p className="store-kicker">Atelier</p>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li><Link href={`${basePath}/pages/shipping`} className="hover:text-[var(--store-gold)]">Delivery</Link></li>
              <li><Link href={`${basePath}/pages/refunds`} className="hover:text-[var(--store-gold)]">Returns</Link></li>
              <li><Link href={`${basePath}/pages/faq`} className="hover:text-[var(--store-gold)]">FAQs</Link></li>
              <li><Link href={`${basePath}/pages/privacy`} className="hover:text-[var(--store-gold)]">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 text-[11px] uppercase tracking-[0.18em] text-white/45 md:px-8">
            <p>© {new Date().getFullYear()} {store.name}</p>
            <a href="https://shopora.space" target="_blank" rel="noreferrer" className="hover:text-[var(--store-gold)]">
              Powered by Shopora
            </a>
          </div>
        </div>
      </footer>
      <StoreAnalyticsTracker domain={domain} />
    </div>
  )
}
