"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"
import { Heart } from "lucide-react"

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

  const { isFavorite, toggleFavorite } = useFavorites()
  const isFaved = isFavorite(product.id)

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
            <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4 tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-slate-900">
                {store.currency} {price.toFixed(2)}
              </span>
              {compareAtPrice !== null && compareAtPrice > price && (
                <span className="text-lg text-slate-400 line-through">
                  {store.currency} {compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="prose prose-slate max-w-none mb-10 text-slate-600 text-[15px] leading-relaxed">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="italic">No description provided.</p>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Options</h3>
                  {selectedVariant && (
                    <span className="text-sm text-slate-500">{selectedVariant.name !== "Default Title" ? selectedVariant.name : ""}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => (
                    <button 
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      className={`min-w-[60px] px-4 py-3 border flex items-center justify-center text-sm font-medium transition-colors ${
                        selectedVariant.id === variant.id 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4 mt-auto">
              <button 
                onClick={() => toggleFavorite(product.id)}
                className="w-14 h-14 border border-slate-200 rounded-none flex items-center justify-center hover:border-slate-900 transition-colors shrink-0"
              >
                <Heart className={`w-6 h-6 ${isFaved ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
              </button>
              <button 
                className="flex-1 h-14 bg-slate-900 text-white text-lg font-bold hover:bg-slate-800 transition-colors"
                style={{ backgroundColor: store.primaryColor || "#0f172a" }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>

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
                {(() => {
                  const stock = selectedVariant?.stockCount || product.stockCount || 0;
                  return stock > 0 ? (
                    <span className="text-green-600 font-medium">In Stock ({stock})</span>
                  ) : (
                    <span className="text-red-500 font-medium">Out of Stock</span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Actions */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 flex items-center gap-3">
          <button 
            onClick={() => toggleFavorite(product.id)}
            className="w-12 h-12 flex items-center justify-center shrink-0 border border-slate-200"
          >
            <Heart className={`w-6 h-6 ${isFaved ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
          </button>
          <button 
            className="flex-1 h-12 bg-slate-900 text-white font-bold"
            style={{ backgroundColor: store.primaryColor || "#0f172a" }}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
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
