"use client"

import Link from "next/link"
import { Heart, Plus } from "lucide-react"
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

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ProductCard({ product, currency, basePath }: ProductCardProps) {
  const cart = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const variant = product.variants?.[0]
  const price = variant?.price ?? product.price ?? 0
  const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice ?? null
  const imageUrl = variant?.imageUrl || product.images?.[0] || null
  const hoverImageUrl = product.images?.find((img) => img !== imageUrl) || null
  const onSale = compareAtPrice !== null && compareAtPrice > price
  const hasChoices = (product.variants?.length ?? 0) > 1

  const isFaved = isFavorite(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    cart.addItem({
      variantId: variant?.id ?? product.id,
      productId: product.id,
      name: variant && variant.name !== "Default" ? `${product.name} - ${variant.name}` : product.name,
      price: price,
      quantity: 1,
      imageUrl: imageUrl,
    })
    cart.openDrawer()
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  const productHref = `${basePath}/product/${product.id}`

  return (
    <Link href={productHref} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#efebe4]">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out ${
                hoverImageUrl ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
              }`}
            />
            {hoverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hoverImageUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 ease-out group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-xl italic text-stone-400">
            {product.name}
          </div>
        )}

        {onSale && (
          <span className="absolute left-3 top-3 bg-[#faf8f5] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-900">
            Sale
          </span>
        )}

        <button
          onClick={handleToggleFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#faf8f5]/90 text-stone-800 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
          aria-label={isFaved ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart className={`h-4 w-4 ${isFaved ? "fill-stone-900" : ""}`} strokeWidth={1.5} />
        </button>

        {hasChoices ? (
          <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-[#faf8f5] py-3 text-center text-[11px] uppercase tracking-[0.2em] text-stone-900 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
            Choose options
          </span>
        ) : (
          <button
            onClick={handleAddToCart}
            className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-[#faf8f5] py-3 text-[11px] uppercase tracking-[0.2em] text-stone-900 opacity-0 transition duration-300 hover:bg-stone-900 hover:text-white group-hover:translate-y-0 group-hover:opacity-100 lg:block"
          >
            Add to bag
          </button>
        )}

        {!hasChoices && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#faf8f5] text-stone-900 shadow-sm lg:hidden"
            aria-label="Add to bag"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="pt-4">
        <h3 className="line-clamp-1 text-sm text-stone-800">{product.name}</h3>
        <div className="mt-1.5 flex items-baseline gap-2 text-sm">
          <span className={onSale ? "text-[var(--store-accent)]" : "text-stone-900"}>{money(currency, price)}</span>
          {onSale && <span className="text-xs text-stone-400 line-through">{money(currency, compareAtPrice!)}</span>}
        </div>
      </div>
    </Link>
  )
}
