"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
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
  const soldOut = !hasChoices && typeof variant?.stockCount === "number" && variant.stockCount <= 0

  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  const isFaved = ready && isFavorite(product.id)

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
      ...(typeof variant?.stockCount === "number" ? { maxQuantity: variant.stockCount } : {}),
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
      <div className="relative aspect-[3/4] overflow-hidden bg-[#efe8dc] ring-1 ring-[var(--store-line)]">
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

        {(soldOut || onSale) && (
          <span className="absolute left-3 top-3 font-display text-sm italic tracking-wide text-white drop-shadow">
            {soldOut ? "Sold out" : "Sale"}
          </span>
        )}

        <button
          onClick={handleToggleFavorite}
          className="absolute right-2.5 top-2.5 text-white drop-shadow-md transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
          aria-label={isFaved ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart className={`h-4 w-4 ${isFaved ? "fill-white" : ""}`} strokeWidth={1.5} />
        </button>

        {soldOut ? null : hasChoices ? (
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-8 text-center text-[10px] uppercase tracking-[0.18em] text-white lg:pb-3 lg:opacity-0 lg:transition lg:duration-300 lg:group-hover:opacity-100">
            Choose options
          </span>
        ) : (
          <button
            onClick={handleAddToCart}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-8 text-center text-[10px] uppercase tracking-[0.18em] text-white lg:pb-3 lg:opacity-0 lg:transition lg:duration-300 lg:group-hover:opacity-100"
            aria-label="Add to bag"
          >
            Add to bag
          </button>
        )}
      </div>

      <div className="pt-5">
        <h3 className="line-clamp-1 font-display text-xl italic leading-tight text-[var(--store-ink)]">{product.name}</h3>
        <div className="mt-1.5 flex items-baseline gap-2 text-[13px] tracking-wide">
          <span className={onSale ? "text-[var(--store-gold)]" : "text-[var(--store-muted)]"}>{money(currency, price)}</span>
          {onSale && <span className="text-xs text-stone-400 line-through">{money(currency, compareAtPrice!)}</span>}
        </div>
      </div>
    </Link>
  )
}
