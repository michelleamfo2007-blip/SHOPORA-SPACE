import { notFound } from "next/navigation"
import Link from "next/link"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Truck, Clock, HeadphonesIcon, MessageCircle } from "lucide-react"

import { headers } from "next/headers"

export default async function StorefrontHomePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain)
  
  if (!store) {
    notFound()
  }

  const headersList = await headers()
    const host = headersList.get("host") || ""
    const isPreview = host.includes("vercel.app") || host.includes("localhost:3000")
    const basePath = isPreview && !host.startsWith(domain) ? `/storefront/${domain}` : ""

    // Fetch active products for this store
    const products = await db.product.findMany({
      where: { 
        storeId: store.id,
        isActive: true
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

    const heroHeadline = store.heroHeadline || `Welcome to ${store.name}`
    const heroSubtext = store.heroSubtext || "Discover our premium collections today."
    const heroImage = store.heroImage || "https://images.unsplash.com/photo-1519725515250-9512f67664c1?q=80&w=2000&auto=format&fit=crop"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Premium Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" /> {/* Dark Overlay */}
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-lg max-w-4xl mx-auto leading-tight">
            {heroHeadline}
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto mb-10 font-light drop-shadow-md">
            {heroSubtext}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`${basePath}/products`}
              className="inline-block bg-white text-slate-900 rounded-full px-8 py-4 text-lg font-semibold shadow-xl transition-transform hover:scale-105"
            >
              Shop Wigs
            </Link>
            <Link
              href="#categories"
              className="inline-block border-2 border-white text-white rounded-full px-8 py-4 text-lg font-semibold transition-all hover:bg-white/10 hover:backdrop-blur-md"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section id="categories" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Shop by Category</h2>
            <div className="h-1 w-20 bg-slate-900 mx-auto rounded-full" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {categories.map((cat) => (
                <Link key={cat.id} href={`${basePath}/categories/${cat.slug}`} className="group relative h-64 overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all">
                  <div className="absolute inset-0 bg-slate-200">
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
                    <h3 className="text-xl font-bold">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl">
              <p className="text-slate-500">Categories coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Featured Collection */}
      <section id="shop" className="py-20 bg-slate-50">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const variant = product.variants[0]
              const price = variant?.price ?? 0
              const compareAtPrice = variant?.compareAtPrice ?? null
              const imageUrl = variant?.imageUrl ?? null
              
              return (
                <Link key={product.id} href={`${basePath}/product/${product.id}`} className="group">
                  <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                    <div className="aspect-[4/5] bg-slate-100 relative w-full overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.name} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50">
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                      {compareAtPrice !== null && compareAtPrice > price && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wider">
                          SALE
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-bold text-lg text-slate-900">
                          {store.currency} {price.toFixed(2)}
                        </span>
                        {compareAtPrice !== null && compareAtPrice > price && (
                          <span className="text-sm text-slate-400 line-through font-medium">
                            {store.currency} {compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-slate-900 text-white text-center py-2.5 rounded-lg font-medium group-hover:bg-opacity-90 transition-all" style={{ backgroundColor: store.primaryColor || '#0f172a' }}>
                        View Product
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
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

      {/* 5. Why Shop With Us */}
      <section className="py-20 bg-slate-900 text-white" style={{ backgroundColor: store.primaryColor || '#0f172a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Shop With Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
              <p className="text-white/70">Carefully selected products built to last.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Shopping</h3>
              <p className="text-white/70">Your information and payments are 100% protected.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Ordering</h3>
              <p className="text-white/70">Order your favorite look in just a few clicks.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <HeadphonesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Support</h3>
              <p className="text-white/70">We're here to help you choose the right products.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Find Your Perfect Match */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
            <div className="p-10 md:p-16 flex-1 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
                Find Your Perfect Match
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Not sure what to choose? Browse our collections to find exactly what you're looking for.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-slate-900 w-20">Category:</div>
                  <div className="text-slate-500">Browse by collection</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-slate-900 w-20">Style:</div>
                  <div className="text-slate-500">Find your unique look</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-slate-900 w-20">Budget:</div>
                  <div className="text-slate-500">All price ranges available</div>
                </div>
              </div>
              <div>
                <Link href={`${basePath}/products`} className="inline-flex items-center justify-center bg-slate-900 text-white rounded-full px-8 py-4 font-semibold hover:bg-slate-800 transition-colors" style={{ backgroundColor: store.primaryColor || '#0f172a' }}>
                  Shop Now <span className="ml-2">→</span>
                </Link>
                <p className="text-xs text-slate-400 mt-4">* AI recommendations coming soon to Shopora!</p>
              </div>
            </div>
            <div className="lg:w-1/2 bg-slate-200 min-h-[300px] relative">
              <img src="https://images.unsplash.com/photo-1595426114644-8d93c048bc78?q=80&w=1000&auto=format&fit=crop" alt="Find your perfect match" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

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

      {/* 8 & 9. Social & Newsletter/WhatsApp */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Social */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Join Our Community</h2>
              <p className="text-lg text-slate-600 mb-8">
                Follow us on Instagram for styling tips, new arrivals, and exclusive drops.
              </p>
              {store.instagramHandle ? (
                <a 
                  href={`https://instagram.com/${store.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full px-8 py-4 font-semibold hover:opacity-90 transition-opacity shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Follow {store.instagramHandle}
                </a>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-500 rounded-full px-8 py-4 font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram coming soon
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center md:text-left border border-slate-100">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Need Help?</h2>
              <p className="text-slate-600 mb-8">
                Get fast support, place orders directly, and get first access to exclusive offers.
              </p>
              {store.whatsappNumber ? (
                <a 
                  href={`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 text-white w-full rounded-full px-8 py-4 font-bold text-lg hover:bg-green-600 transition-colors shadow-md"
                >
                  <MessageCircle className="w-6 h-6" />
                  WhatsApp Us Now
                </a>
              ) : (
                <form className="flex flex-col sm:flex-row gap-3">
                  <input type="email" placeholder="Your email address" className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  <button type="button" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold" style={{ backgroundColor: store.primaryColor || '#0f172a' }}>
                    Join Us
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
