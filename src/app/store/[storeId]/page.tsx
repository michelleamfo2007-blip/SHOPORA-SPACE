import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function StorefrontHomePage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({ where: { slug: storeId } })
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="rounded-2xl bg-slate-900 text-white p-8 md:p-16 mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Welcome to {store.name}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
          {store.description || "Discover our curated collection of amazing products."}
        </p>
        <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
          Shop Now
        </Button>
      </div>

      {/* Featured Products */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Products</h2>
        <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          View all →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-lg border border-slate-200 border-dashed">
          <p className="text-slate-500">No products available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const price = product.variants[0]?.price || 0
            
            return (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-200 border-transparent bg-white group cursor-pointer">
                  <div className="aspect-square bg-slate-100 relative w-full overflow-hidden">
                    {/* Placeholder for Product Image */}
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2 truncate">
                      {product.categories.map(c => c.name).join(", ")}
                    </p>
                    <div className="font-medium text-slate-900">
                      {store.currency} {price.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
