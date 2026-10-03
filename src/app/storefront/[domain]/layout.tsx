import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import { Search } from "lucide-react"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { isSubscriptionLapsed } from "@/lib/subscription"
import { getStoreAccent, getStorefrontBasePath, whatsappLink } from "@/lib/storefront"
import { CartDrawer } from "@/components/storefront/CartDrawer"
import { MobileMenu } from "@/components/storefront/MobileMenu"
import { SocialIcons } from "@/components/storefront/SocialIcons"
import { StoreAnalyticsTracker } from "@/components/storefront/StoreAnalyticsTracker"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-store-display",
})

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
  const fontClasses = `${display.variable} ${sans.variable} font-store`
  const whatsappHref = store.whatsappNumber ? whatsappLink(store.whatsappNumber) : null

  if (isSubscriptionLapsed(store.subscription)) {
    return (
      <div className={`${fontClasses} flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center text-stone-900`}>
        {store.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.logoUrl} alt={`${store.name} Logo`} className="mb-8 h-16 w-auto object-contain" />
        )}
        <h1 className="font-display text-5xl">{store.name}</h1>
        <p className="mt-4 max-w-sm text-stone-600">This store is temporarily unavailable. Please check back soon.</p>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-8 rounded-full border border-stone-900 px-7 py-3 text-sm tracking-wide text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
          >
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
    <div className={`${fontClasses} flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-clip bg-[#faf8f5] text-stone-900`} style={themeStyle}>
      <div className="bg-[var(--store-accent)] px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-white">
        Delivery fee paid on arrival
      </div>

      {/* No backdrop-filter here: it would trap the fixed menu and bag panels inside the header. */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf8f5]">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 md:h-20 md:px-8">
          <div className="flex items-center">
            <MobileMenu storeName={store.name} basePath={basePath} hasCategories={hasCategories} whatsappHref={whatsappHref} />
            <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-[13px] uppercase tracking-[0.15em] text-stone-600 transition-colors hover:text-stone-900">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href={`${basePath}/`} className="flex min-w-0 items-center gap-2 justify-self-center md:gap-3">
            {store.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover md:h-11 md:w-11" />
            )}
            <span className="max-w-[40vw] truncate font-display text-xl leading-none tracking-tight md:max-w-none md:text-[32px]">
              {store.name}
            </span>
          </Link>

          <div className="flex items-center justify-end md:gap-4">
            <Link href={`${basePath}/products`} aria-label="Search products" className="flex h-10 w-10 items-center justify-center text-stone-900">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <CartDrawer currency={store.currency} basePath={basePath} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-stone-200 bg-[#f3efe8]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-16">
          <div>
            <p className="font-display text-3xl">{store.name}</p>
            {store.description && <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">{store.description}</p>}
            <div className="mt-6">
              <SocialIcons store={store} />
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Shop</p>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              <li><Link href={`${basePath}/products`} className="hover:text-stone-950">All products</Link></li>
              {hasCategories && <li><Link href={`${basePath}/categories`} className="hover:text-stone-950">Collections</Link></li>}
              {whatsappHref && <li><a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-stone-950">Order on WhatsApp</a></li>}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Help</p>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              <li><Link href={`${basePath}/pages/shipping`} className="hover:text-stone-950">Delivery</Link></li>
              <li><Link href={`${basePath}/pages/refunds`} className="hover:text-stone-950">Returns</Link></li>
              <li><Link href={`${basePath}/pages/faq`} className="hover:text-stone-950">FAQs</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-300/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 text-xs text-stone-500 md:px-8">
            <p>© {new Date().getFullYear()} {store.name}</p>
            <a href="https://shopora.space" target="_blank" rel="noreferrer" className="hover:text-stone-900">
              Powered by Shopora
            </a>
          </div>
        </div>
      </footer>
      <StoreAnalyticsTracker domain={domain} />
    </div>
  )
}
