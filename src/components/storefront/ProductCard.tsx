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
  storeName?: string
  blackFriday?: boolean
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ProductCard({ product, currency, basePath, storeName, blackFriday }: ProductCardProps) {
  const cart = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const variant = product.variants?.[0]
  const price = variant?.price ?? product.price ?? 0
  const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice ?? null
  const imageUrl = variant?.imageUrl || product.images?.[0] || null
  const hoverImageUrl = product.images?.find((img) => img !== imageUrl) || null
  const onSale = compareAtPrice !== null && compareAtPrice > price
  const saved = onSale ? compareAtPrice - price : 0
  const percentOff = onSale && compareAtPrice > 0 ? Math.round((1 - price / compareAtPrice) * 100) : 0
  const hasChoices = (product.variants?.length ?? 0) > 1
  const soldOut = !hasChoices && typeof variant?.stockCount === "number" && variant.stockCount <= 0
  const showSaleBar = Boolean(blackFriday && onSale)

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

        {(soldOut || (onSale && !showSaleBar)) && (
          <span className="absolute left-3 top-3 bg-[var(--store-paper)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--store-ink)]">
            {soldOut ? "Sold out" : "Sale"}
          </span>
        )}

        <button
          onClick={handleToggleFavorite}
          className={`absolute right-2.5 top-2.5 text-white drop-shadow-md transition-opacity ${
            isFaved ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
          }`}
          aria-label={isFaved ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart className={`h-4 w-4 ${isFaved ? "fill-white" : ""}`} strokeWidth={1.5} />
        </button>
      </div>

      {showSaleBar && (
        <div className="bg-[var(--store-gold)] px-2.5 py-2 text-[#f7f3ec]">
          {storeName && (
            <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.08em]">{storeName}</p>
          )}
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="text-[12px] font-semibold leading-none">Save {money(currency, saved)}</p>
            <div className="shrink-0 text-right">
              <span className="inline-block bg-black px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em]">
                Black Friday
              </span>
              {percentOff > 0 && <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em]">{percentOff}% off</p>}
            </div>
          </div>
        </div>
      )}

      <div className="pt-4">
        <h3 className="line-clamp-2 font-display text-lg italic leading-snug text-[var(--store-ink)] md:text-xl">{product.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] tracking-wide">
          <span className={onSale ? "text-[var(--store-gold)]" : "text-[var(--store-muted)]"}>{money(currency, price)}</span>
          {showSaleBar && percentOff > 0 && (
            <span className="bg-[var(--store-gold)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--store-gold)]">-{percentOff}%</span>
          )}
          {onSale && <span className="text-xs text-stone-400 line-through">{money(currency, compareAtPrice!)}</span>}
        </div>
        {!soldOut && (
          hasChoices ? (
            <span className="mt-3 flex h-10 items-center justify-center bg-[var(--store-ink)] text-[10px] font-medium uppercase tracking-[0.16em] text-[#f7f3ec]">
              Choose options
            </span>
          ) : (
            <button
              onClick={handleAddToCart}
              className="mt-3 flex h-10 w-full items-center justify-center bg-[var(--store-ink)] text-[10px] font-medium uppercase tracking-[0.16em] text-[#f7f3ec]"
              aria-label="Add to bag"
            >
              Add to bag
            </button>
          )
        )}
      </div>
    </Link>
  )
}
