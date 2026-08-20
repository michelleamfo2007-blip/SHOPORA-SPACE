"use client"

import Link from "next/link"
import { Heart, Eye, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"

type Product = {
  id: string
  name: string
  price: number | null
  compareAtPrice: number | null
  variants: any[]
  images: string[]
}

type ProductCardProps = {
  product: Product
  currency: string
  basePath: string
}

export function ProductCard({ product, currency, basePath }: ProductCardProps) {
  const cart = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  
  const variant = product.variants?.[0]
  const price = variant?.price ?? product.price ?? 0
  const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice ?? null
  const imageUrl = variant?.imageUrl || product.images?.[0] || null

  const isFaved = isFavorite(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    cart.addItem({
      variantId: variant?.id ?? product.id,
      productId: product.id,
      name: variant ? `${product.name} - ${variant.name}` : product.name,
      price: price,
      quantity: 1,
      imageUrl: imageUrl,
    })
    alert("Added to cart!")
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = `${basePath}/product/${product.id}`
  }

  return (
    <Link href={`${basePath}/product/${product.id}`} className="group block">
      <div className="relative mb-4 aspect-[4/5] bg-[#f9f9f9] overflow-hidden rounded-md">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            No Image
          </div>
        )}
        
        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleToggleFavorite}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform text-slate-700 hover:text-red-500"
            aria-label="Add to favorites"
          >
            <Heart className={`w-5 h-5 ${isFaved ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button 
            onClick={handleQuickView}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform text-slate-700"
            aria-label="Quick view"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={handleAddToCart}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform text-slate-700 hover:text-green-600"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        {compareAtPrice !== null && compareAtPrice > price && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1 tracking-widest rounded-sm">
            SALE
          </div>
        )}
      </div>

      <div className="text-left px-1">
        <h3 className="font-serif text-[15px] text-slate-900 mb-1 leading-snug truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[15px] text-slate-900">
            {currency} {price.toFixed(2)}
          </span>
          {compareAtPrice !== null && compareAtPrice > price && (
            <span className="text-xs text-slate-400 line-through">
              {currency} {compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
