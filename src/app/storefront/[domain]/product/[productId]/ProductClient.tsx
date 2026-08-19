"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"

export function ProductClient({ product, store }: { product: any, store: any }) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0])
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    product.variants?.[0]?.imageUrl || product.images?.[0] || null
  )

  const price = selectedVariant?.price ?? product.price ?? 0
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice

  // Collect all unique images for the gallery
  const allImages = Array.from(new Set([
    ...(product.images || []),
    ...(product.variants?.map((v: any) => v.imageUrl).filter(Boolean) || [])
  ])) as string[]

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant)
    if (variant.imageUrl) {
      setActiveImageUrl(variant.imageUrl)
    }
  }

  const cart = useCart()

  const handleAddToCart = () => {
    cart.addItem({
      variantId: selectedVariant?.id ?? product.id, // Fallback to product.id if no variants
      productId: product.id,
      name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      price: price,
      quantity: 1,
      imageUrl: activeImageUrl || product.images?.[0],
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
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/5] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 w-full overflow-hidden relative">
              {activeImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImageUrl} alt={product.name} className="object-cover w-full h-full" />
              ) : (
                <span>No Image Available</span>
              )}
              {compareAtPrice && compareAtPrice > price && (
                <div className="absolute top-6 right-6 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  SALE
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageUrl(img)}
                    className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageUrl === img ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} - image ${idx + 1}`} className="object-cover w-full h-full bg-slate-100" />
                  </button>
                ))}
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
                      onClick={() => handleVariantSelect(variant)}
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
                {selectedVariant?.sku || product.sku || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Category</span>
                {product.categories.map((c: any) => c.name).join(", ") || "None"}
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Availability</span>
                {(selectedVariant?.stockCount ?? product.stockCount) > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({(selectedVariant?.stockCount ?? product.stockCount)})</span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Video */}
        {product.videoUrl && (
          <div className="mt-16 pt-16 border-t border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Product Video</h3>
            <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg bg-black">
              <video 
                src={product.videoUrl} 
                controls 
                className="w-full h-auto aspect-video object-contain"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
