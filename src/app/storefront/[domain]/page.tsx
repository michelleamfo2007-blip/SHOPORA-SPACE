import { notFound } from "next/navigation"
import Link from "next/link"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { ProductCard } from "@/components/storefront/ProductCard"

import { headers } from "next/headers"

export default async function StorefrontHomePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain)
  
  if (!store) {
    notFound()
  }

  const headersList = await headers()
    const host = headersList.get("host") || ""
    const isPreview = host.includes("vercel.app") || host.includes("localhost:3000") || host === "shopora.space" || host === "www.shopora.space"
    // If testing via Vercel preview or localhost, the base path is /storefront/[domain]
    // Otherwise on the actual custom domain, the base path is just /
    const basePath = isPreview ? `/storefront/${domain}` : ""

    // Fetch active products for this store
    const products = await db.product.findMany({
      where: { 
        storeId: store.id,
        status: "ACTIVE",
        visibility: "VISIBLE"
      },
      include: {
        variants: {
          take: 1
        },
        categories: true
      },
      orderBy: { createdAt: "desc" },
      take: 8 // Featured products
    })

    const categories = await db.category.findMany({
      where: { storeId: store.id },
      take: 8
    })

    const reviews = await db.review.findMany({
      where: { storeId: store.id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { customer: true }
    })

    const heroImage = store.heroImage
    const heroHeadline = store.heroHeadline
    const heroSubtext = store.heroSubtext

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white">
        {heroImage ? (
          <div>
            <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
              <div className="overflow-hidden rounded-2xl bg-neutral-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={heroHeadline || store.name}
                  className="h-56 w-full object-cover object-center sm:h-72 md:h-80"
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-6 sm:flex-row">
              <Link
                href={`${basePath}/products`}
                className="inline-block rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white"
              >
                Shop Now
              </Link>
              <Link
                href="#shop"
                className="inline-block rounded-full border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-900"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="px-6 py-24 text-center text-white"
            style={{ backgroundColor: store.primaryColor || "#0f172a" }}
          >
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              {heroHeadline || `Welcome to ${store.name}`}
            </h1>
            {(heroSubtext || store.description) && (
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                {heroSubtext || store.description}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`${basePath}/products`}
                className="inline-block rounded-full bg-white px-8 py-3.5 text-base font-semibold text-slate-900"
              >
                Shop Now
              </Link>
              <Link
                href="#shop"
                className="inline-block rounded-full border border-white px-8 py-3.5 text-base font-semibold text-white"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        )}

        {heroImage && (heroHeadline || heroSubtext) && (
          <div className="px-6 py-8 text-center">
            {heroHeadline && (
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">{heroHeadline}</h1>
            )}
            {heroSubtext && (
              <p className="mx-auto mt-3 max-w-xl text-slate-600">{heroSubtext}</p>
            )}
          </div>
        )}
      </section>

      {categories.length > 0 && (
      <section id="categories" className="bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`${basePath}/categories/${cat.slug}`} className="flex h-28 items-end rounded-2xl bg-slate-100 p-4">
                <h3 className="text-base font-semibold text-slate-900">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      <section id="shop" className="bg-slate-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Featured Collection</h2>
              <div className="h-1 w-20 bg-slate-900 rounded-full" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
            </div>
            <Link href={`${basePath}/products`} className="text-blue-600 font-semibold hover:underline hidden sm:block" style={{ color: store.primaryColor || '#2563eb' }}>
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={store.currency}
                basePath={basePath}
              />
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link href={`${basePath}/products`} className="inline-block bg-white text-slate-900 border border-slate-200 rounded-full px-8 py-3 font-semibold shadow-sm">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Seller Introduction */}
      {store.aboutText && (
        <section id="about" className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
                Meet {store.name}
              </h2>
              <div className="h-1 w-20 mx-auto rounded-full mb-10" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
              <p className="text-xl leading-relaxed text-slate-600">
                {store.aboutText}
              </p>
            </div>
          </div>
        </section>
      )}



      {/* 7. Reviews */}
      {reviews.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-12">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map(review => (
                <div key={review.id} className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <div className="flex justify-center gap-1 text-yellow-400 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg font-medium text-slate-900 italic mb-8 flex-1">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-auto">
                    <div className="w-10 h-10 bg-slate-300 rounded-full overflow-hidden flex items-center justify-center text-slate-600 font-bold">
                      {review.customer?.name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">{review.customer?.name || "Verified Customer"}</div>
                      <div className="text-sm text-slate-500">Verified Buyer</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



    </div>
  )
}
