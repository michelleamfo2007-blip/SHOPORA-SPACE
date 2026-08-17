import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"

export default async function StorefrontProductPage({ 
  params 
}: { 
  params: { storeId: string; productId: string } 
}) {
  const store = await getStoreByHost(params.storeId)
  if (!store) notFound()

  const product = await db.product.findUnique({
    where: { 
      id: params.productId,
      storeId: store.id,
      isActive: true
    },
    include: {
      variants: true,
      categories: true
    }
  })

  if (!product) notFound()

  // For MVP, select first variant as default
  const defaultVariant = product.variants[0]
  const price = defaultVariant?.price || 0

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-12 lg:p-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Product Image Gallery (Placeholder) */}
          <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 w-full">
            Product Image Viewer
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {product.name}
            </h1>
            
            <div className="text-2xl font-semibold text-slate-900 mb-6">
              {store.currency} {price.toFixed(2)}
            </div>

            <div className="prose prose-slate max-w-none mb-8 text-slate-600">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="italic">No description provided.</p>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants.length > 1 && (
              <div className="mb-8">
                <h3 className="font-medium text-slate-900 mb-3">Options</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => (
                    <button 
                      key={variant.id}
                      className="px-4 py-2 border rounded-md text-sm hover:border-slate-900 transition-colors"
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button size="lg" className="w-full md:w-auto mt-auto">
              Add to Cart
            </Button>

            <div className="mt-8 border-t pt-6 text-sm text-slate-500">
              <p>SKU: {defaultVariant?.sku || "N/A"}</p>
              <p className="mt-2">
                Categories: {product.categories.map(c => c.name).join(", ") || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
