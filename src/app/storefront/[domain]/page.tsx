import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function StorefrontHomePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain)
  if (!store) notFound()

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
    take: 12
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            {store.name}
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 font-light">
            {store.description || "Discover our curated collection of amazing products."}
          </p>
          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 py-6 text-lg font-medium shadow-xl transition-transform hover:scale-105">
            Shop Collection
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Products */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Products</h2>
          <Link href="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center">
            View all <span className="ml-1">→</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-lg">No products available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const variant = product.variants[0]
              const price = variant?.price || 0
              const compareAtPrice = variant?.compareAtPrice
              const imageUrl = variant?.imageUrl
              
              return (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-100 bg-white group cursor-pointer rounded-2xl">
                    <div className="aspect-[4/5] bg-slate-100 relative w-full overflow-hidden">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={imageUrl} 
                          alt={product.name} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50">
                          <span className="text-sm font-medium">No Image</span>
                        </div>
                      )}
                      
                      {compareAtPrice && compareAtPrice > price && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          SALE
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        {product.categories.map(c => c.name).join(", ") || "Uncategorized"}
                      </p>
                      <h3 className="font-semibold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-3">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-slate-900">
                          {store.currency} {price.toFixed(2)}
                        </span>
                        {compareAtPrice && compareAtPrice > price && (
                          <span className="text-sm text-slate-400 line-through font-medium">
                            {store.currency} {compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
