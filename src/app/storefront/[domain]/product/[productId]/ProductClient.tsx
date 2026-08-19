"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"

export function ProductClient({ product, store }: { product: any, store: any }) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])

  const price = selectedVariant?.price || 0
  const compareAtPrice = selectedVariant?.compareAtPrice
  const imageUrl = selectedVariant?.imageUrl

  const cart = useCart()

  const handleAddToCart = () => {
    cart.addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      price: selectedVariant.price,
      quantity: 1,
      imageUrl: selectedVariant.imageUrl,
    })
    
    // Instead of redirecting to checkout immediately, we can open the cart or notify the user
    // Since we now have a Cart Drawer, it will update automatically.
    // If they want to go straight to checkout, we can keep the routing:
    // We will just let the user open the cart drawer for now, so we remove the auto-redirect.
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-12 lg:p-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Product Image Gallery */}
          <div className="aspect-[4/5] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 w-full overflow-hidden relative">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <span>No Image Available</span>
            )}
            {compareAtPrice && compareAtPrice > price && (
              <div className="absolute top-6 right-6 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                SALE
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-blue-600">
                {store.currency} {price.toFixed(2)}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-xl text-slate-400 line-through font-medium">
                  {store.currency} {compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="prose prose-slate max-w-none mb-10 text-slate-600 text-lg leading-relaxed">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="italic">No description provided.</p>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants.length > 1 && (
              <div className="mb-10">
                <h3 className="font-semibold text-slate-900 mb-4 text-lg">Select Option</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant: any) => (
                    <button 
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-3 border-2 rounded-xl text-sm font-medium transition-all ${
                        selectedVariant.id === variant.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full mt-auto py-7 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: store.primaryColor || "#2563eb", color: "#ffffff" }}
              onClick={handleAddToCart}
            >
              Add to Cart & Checkout
            </Button>

            <div className="mt-10 border-t pt-8 text-sm text-slate-500 grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">SKU</span>
                {selectedVariant?.sku || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Category</span>
                {product.categories.map((c: any) => c.name).join(", ") || "None"}
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Availability</span>
                {selectedVariant?.stockCount > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({selectedVariant.stockCount})</span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
