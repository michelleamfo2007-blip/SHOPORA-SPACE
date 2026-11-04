"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Heart, Minus, Plus, Share2, Star } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"
import { ProductCard } from "@/components/storefront/ProductCard"
import { StorefrontReviewForm } from "@/components/storefront/StorefrontReviewForm"

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export type ProductReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  customerName: string
}

type ProductClientProps = {
  product: any
  store: any
  basePath: string
  related: any[]
  domain: string
  reviews: ProductReview[]
}

function Stars({ rating, className = "h-3.5 w-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="flex gap-0.5 text-[var(--store-accent)]" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < Math.round(rating) ? "fill-current" : "fill-stone-200 text-stone-200"}`} strokeWidth={0} />
      ))}
    </span>
  )
}

export function ProductClient({ product, store, basePath, related, domain, reviews }: ProductClientProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt: any, i: number) => {
        const variantParts = product.variants?.[0]?.name.split(' / ') || []
        initial[opt.name] = variantParts[i] || opt.values?.[0]?.value || ""
      })
    }
    return initial
  })

  // Fallback for products without proper option structure
  const [fallbackVariant, setFallbackVariant] = useState(product.variants?.[0])
  const [quantity, setQuantity] = useState(1)

  const activeVariant = useMemo(() => {
    if (product.options && product.options.length > 0) {
      const expectedName = product.options.map((opt: any) => selectedOptions[opt.name]).join(' / ')
      return product.variants.find((v: any) => v.name === expectedName) || product.variants?.[0]
    }
    return fallbackVariant
  }, [selectedOptions, fallbackVariant, product.options, product.variants])

  const variantKey = activeVariant?.id ?? "default"
  const variantImage = activeVariant?.imageUrl || product.images?.[0] || null
  const [pickedImage, setPickedImage] = useState<{ key: string; url: string } | null>(null)
  const activeImageUrl = pickedImage && pickedImage.key === variantKey ? pickedImage.url : variantImage

  const price = activeVariant?.price ?? product.price ?? 0
  const compareAtPrice = activeVariant?.compareAtPrice ?? product.compareAtPrice
  const onSale = compareAtPrice !== null && compareAtPrice !== undefined && compareAtPrice > price
  const stock = activeVariant?.stockCount ?? product.stockCount ?? 0
  const soldOut = stock <= 0
  const variantLabel = activeVariant && activeVariant.name !== "Default" ? activeVariant.name : null

  const allImages = Array.from(new Set([
    ...(product.images || []),
    ...(product.variants?.map((v: any) => v.imageUrl).filter(Boolean) || [])
  ])) as string[]
  // On phones the gallery is a swipe strip; start it on the photo for the chosen option.
  const mobileImages = activeImageUrl ? [activeImageUrl, ...allImages.filter((img) => img !== activeImageUrl)] : allImages

  const ratingAvg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [shareNote, setShareNote] = useState<string | null>(null)

  const handleShare = async () => {
    const url = window.location.href
    const text = `${product.name} · ${money(store.currency, price)} at ${store.name}`
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url })
        return
      } catch {
        // User closed the share sheet; fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareNote("Link copied")
    } catch {
      setShareNote(url)
    }
    setTimeout(() => setShareNote(null), 2500)
  }

  const cart = useCart()

  const handleAddToCart = () => {
    if (soldOut) return
    cart.addItem({
      variantId: activeVariant?.id ?? product.id,
      productId: product.id,
      name: variantLabel ? `${product.name} - ${variantLabel}` : product.name,
      price: price,
      quantity,
      imageUrl: activeImageUrl || product.images?.[0],
    })
    cart.openDrawer()
  }

  const { isFavorite, toggleFavorite } = useFavorites()
  const isFaved = isFavorite(product.id)

  const buildWhatsappHref = (pageUrl?: string) =>
    `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
      `Hi ${store.name}, I'd like to order ${quantity} x ${product.name}${variantLabel ? ` (${variantLabel})` : ""} at ${money(store.currency, price)}.${
        pageUrl ? `\n${pageUrl}` : ""
      }`
    )}`
  const whatsappHref = store.whatsappNumber ? buildWhatsappHref() : null

  const deliveryText = store.deliveryPolicy || "The delivery fee is paid to the rider when your order arrives. Message us for delivery times to your area."

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-6 md:px-8 md:pb-0 md:pt-10">
      <nav className="mb-6 text-[11px] uppercase tracking-[0.2em] text-stone-500 md:mb-10">
        <Link href={`${basePath}/`} className="hover:text-stone-900">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`${basePath}/products`} className="hover:text-stone-900">Shop</Link>
        {product.categories?.[0] && (
          <>
            <span className="mx-2">/</span>
            <Link href={`${basePath}/categories/${product.categories[0].slug}`} className="hover:text-stone-900">{product.categories[0].name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <MobileGallery
          key={variantKey}
          images={mobileImages}
          name={product.name}
          badge={soldOut ? "Sold out" : onSale ? "Sale" : null}
        />
        <div className="hidden min-w-0 flex-col-reverse gap-4 self-start md:flex lg:flex-row">
          {allImages.length > 1 && (
            <div className="scrollbar-none flex gap-3 overflow-x-auto lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-visible">
              {allImages.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setPickedImage({ key: variantKey, url: img })}
                  className={`aspect-[3/4] w-16 shrink-0 overflow-hidden bg-[#efebe4] transition lg:w-full ${
                    activeImageUrl === img ? "ring-1 ring-stone-900 ring-offset-2 ring-offset-[#faf8f5]" : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Show image ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#efebe4]">
            {activeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeImageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-2xl italic text-stone-400">{product.name}</div>
            )}
            {(soldOut || onSale) && (
              <span className="absolute left-4 top-4 bg-[#faf8f5] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]">
                {soldOut ? "Sold out" : "Sale"}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 md:sticky md:top-28 md:self-start">
          <div className="flex items-start justify-between gap-4">
            <h1 className="break-words font-display text-4xl leading-tight tracking-tight md:text-5xl">{product.name}</h1>
            <button
              onClick={handleShare}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 text-stone-800 transition-colors hover:border-stone-900"
              aria-label="Share this product"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          {shareNote && <p className="mt-2 break-all text-xs text-stone-500">{shareNote}</p>}

          {reviews.length > 0 && (
            <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900">
              <Stars rating={ratingAvg} />
              <span>
                {ratingAvg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </a>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className={`text-xl ${onSale ? "text-[var(--store-accent)]" : "text-stone-900"}`}>{money(store.currency, price)}</span>
            {onSale && <span className="text-sm text-stone-400 line-through">{money(store.currency, compareAtPrice)}</span>}
          </div>

          {product.options && product.options.length > 0 ? (
            <div className="mt-8 flex flex-col gap-6 border-t border-stone-200 pt-8">
              {product.options.map((opt: any) => {
                const isColour = ["color", "colour"].includes(opt.name.toLowerCase())
                return (
                  <div key={opt.id}>
                    <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                      {opt.name}: <span className="text-stone-900">{selectedOptions[opt.name]}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val: any) => {
                        const isSelected = selectedOptions[opt.name] === val.value
                        const select = () => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val.value }))
                        if (isColour) {
                          return (
                            <button
                              key={val.id}
                              onClick={select}
                              title={val.value}
                              aria-label={val.value}
                              className={`h-9 w-9 rounded-full border border-stone-300 transition ${isSelected ? "ring-1 ring-stone-900 ring-offset-2 ring-offset-[#faf8f5]" : ""}`}
                              style={{ backgroundColor: val.value.toLowerCase().replace(/ /g, "") }}
                            />
                          )
                        }
                        return (
                          <button
                            key={val.id}
                            onClick={select}
                            className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
                              isSelected ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 text-stone-800 hover:border-stone-900"
                            }`}
                          >
                            {val.value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : product.variants.length > 1 && (
            <div className="mt-8 border-t border-stone-200 pt-8">
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                Option: <span className="text-stone-900">{variantLabel}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant: any) => {
                  const isSelected = activeVariant?.id === variant.id
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setFallbackVariant(variant)}
                      className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
                        isSelected ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 text-stone-800 hover:border-stone-900"
                      }`}
                    >
                      {variant.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-8 hidden gap-3 md:flex">
            <div className="flex h-13 items-center border border-stone-300">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-full w-11 items-center justify-center text-stone-600 hover:text-stone-900" aria-label="Decrease quantity">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(99, q + 1))} className="flex h-full w-11 items-center justify-center text-stone-600 hover:text-stone-900" aria-label="Increase quantity">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={soldOut}
              className="h-13 flex-1 rounded-full bg-[var(--store-accent)] text-sm tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
            >
              {soldOut ? "Sold out" : "Add to bag"}
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-stone-300 transition-colors hover:border-stone-900"
              aria-label={isFaved ? "Remove from favourites" : "Add to favourites"}
            >
              <Heart className={`h-5 w-5 ${isFaved ? "fill-stone-900" : ""}`} strokeWidth={1.5} />
            </button>
          </div>

          {whatsappHref && (
            <a
              href={whatsappHref}
              onClick={(e) => { e.currentTarget.href = buildWhatsappHref(window.location.href) }}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex h-13 w-full items-center justify-center rounded-full border border-stone-900 text-sm tracking-wide text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
            >
              {soldOut ? "Ask about restock on WhatsApp" : "Order on WhatsApp"}
            </a>
          )}

          <p className="mt-5 text-sm text-stone-500">
            {stock > 5 && "In stock and ready to order."}
            {stock > 0 && stock <= 5 && `Only ${stock} left.`}
            {soldOut && (whatsappHref ? "Sold out for now. Message the seller to ask about restock." : "Sold out for now.")}
          </p>

          {product.sizeGuideUrl && (
            <a
              href={product.sizeGuideUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-stone-700 underline underline-offset-4 hover:text-stone-900"
            >
              View size guide
            </a>
          )}

          <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
            <details open className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.2em] text-stone-900">
                Description <Plus className="h-3.5 w-3.5 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                {product.description || "No description provided yet. Message the seller for more details."}
              </p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.2em] text-stone-900">
                Delivery <Plus className="h-3.5 w-3.5 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-600">{deliveryText}</p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.2em] text-stone-900">
                Returns <Plus className="h-3.5 w-3.5 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                Read the{" "}
                <Link href={`${basePath}/pages/refunds`} className="underline underline-offset-4 hover:text-stone-900">returns policy</Link>
                {" "}before you order.
              </p>
            </details>
          </div>

          {(activeVariant?.sku || product.sku) && (
            <p className="mt-5 text-xs text-stone-400">SKU {activeVariant?.sku || product.sku}</p>
          )}
        </div>
      </div>

      <section id="reviews" className="mt-20 scroll-mt-28 border-t border-stone-200 pt-16 md:mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">Reviews</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              {reviews.length ? `${ratingAvg.toFixed(1)} out of 5` : "No reviews yet"}
            </h2>
            {reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                <Stars rating={ratingAvg} className="h-4 w-4" />
                Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </div>
            )}
          </div>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="h-12 rounded-full border border-stone-900 px-7 text-sm tracking-wide text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
            >
              Write a review
            </button>
          )}
        </div>

        {showReviewForm && (
          <div className="mx-auto mt-10 max-w-lg bg-[#f3efe8] p-6 md:p-8">
            <StorefrontReviewForm domain={domain} productId={product.id} title={`Review ${product.name}`} />
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <figure key={review.id} className="border-t border-stone-200 pt-6">
                <Stars rating={review.rating} />
                {review.comment && (
                  <blockquote className="mt-4 font-display text-xl italic leading-snug text-stone-800">
                    &ldquo;{review.comment}&rdquo;
                  </blockquote>
                )}
                <figcaption className="mt-4 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  {review.customerName} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {product.videoUrl && (
        <section className="mt-20 border-t border-stone-200 pt-16 md:mt-28">
          <h2 className="mb-8 text-center font-display text-4xl">See it in motion</h2>
          <div className="mx-auto max-w-3xl overflow-hidden bg-stone-950">
            <video src={product.videoUrl} controls className="aspect-video h-auto w-full object-contain" preload="metadata">
              Your browser does not support the video tag.
            </video>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20 border-t border-stone-200 pt-16 md:mt-28">
          <h2 className="mb-10 font-display text-4xl md:text-5xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} currency={store.currency} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-stone-200 bg-[#faf8f5]/95 px-5 py-3 backdrop-blur md:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-stone-500">{product.name}</p>
          <p className="text-sm text-stone-900">{money(store.currency, price)}</p>
        </div>
        <button
          onClick={() => toggleFavorite(product.id)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-300"
          aria-label={isFaved ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart className={`h-5 w-5 ${isFaved ? "fill-stone-900" : ""}`} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={soldOut}
          className="h-12 rounded-full bg-[var(--store-accent)] px-7 text-sm tracking-wide text-white disabled:bg-stone-300 disabled:text-stone-600"
        >
          {soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </div>
  )
}

/** Phone gallery: swipe between photos with dots underneath. */
function MobileGallery({ images, name, badge }: { images: string[]; name: string; badge: string | null }) {
  const [index, setIndex] = useState(0)

  return (
    <div className="-mx-5 md:hidden">
      <div
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
      >
        {images.length === 0 ? (
          <div className="flex aspect-[4/5] w-full shrink-0 items-center justify-center bg-[#efebe4] font-display text-2xl italic text-stone-400">
            {name}
          </div>
        ) : (
          images.map((img, i) => (
            <div key={img} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-[#efebe4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={i === 0 ? name : ""} className="h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))
        )}
      </div>
      <div className="relative">
        {badge && (
          <span className="absolute bottom-[calc(100%+12px)] left-4 bg-[#faf8f5] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]">
            {badge}
          </span>
        )}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-3">
            {images.map((img, i) => (
              <span
                key={img}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-stone-900" : "w-1.5 bg-stone-300"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
