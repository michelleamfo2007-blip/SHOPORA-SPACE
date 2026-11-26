"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Heart, Plus, Share2, Star } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"
import { StorefrontReviewForm } from "@/components/storefront/StorefrontReviewForm"
import { blackFridayIsLive } from "@/lib/black-friday"

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function variantTokens(variant: any): string[] {
  const fromName = String(variant?.name || "")
    .split(" / ")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const fromOptions = (variant?.optionValues || []).map((ov: any) => String(ov.value || "").trim().toLowerCase()).filter(Boolean)
  return [...new Set([...fromName, ...fromOptions])]
}

function variantHasValues(variant: any, values: string[]) {
  const tokens = variantTokens(variant)
  return values.every((value) => tokens.includes(value.trim().toLowerCase()))
}

function optionsFromVariant(variant: any, options: any[], fallback: Record<string, string> = {}) {
  const next: Record<string, string> = { ...fallback }
  for (const opt of options || []) {
    const fromLink = variant?.optionValues?.find((ov: any) => ov.option?.name === opt.name)?.value
    if (fromLink) {
      next[opt.name] = fromLink
      continue
    }
    const match = opt.values?.find((val: any) => variantTokens(variant).includes(String(val.value).trim().toLowerCase()))
    if (match) next[opt.name] = match.value
  }
  return next
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
      const wanted = product.options.map((opt: any) => selectedOptions[opt.name]).filter(Boolean)
      const exact = product.variants.find((v: any) => variantHasValues(v, wanted))
      if (exact) return exact
      const colourOpt = product.options.find((opt: any) => ["color", "colour"].includes(String(opt.name).toLowerCase()))
      const colour = colourOpt ? selectedOptions[colourOpt.name] : null
      if (colour) {
        const sameColour = product.variants.find((v: any) => variantHasValues(v, [colour]) && v.imageUrl)
        if (sameColour) return sameColour
        return product.variants.find((v: any) => variantHasValues(v, [colour])) || product.variants?.[0]
      }
      return product.variants?.[0]
    }
    return fallbackVariant
  }, [selectedOptions, fallbackVariant, product.options, product.variants])

  const variantKey = activeVariant?.id ?? "default"
  const colourOption = product.options?.find((opt: any) => ["color", "colour"].includes(String(opt.name).toLowerCase()))
  const selectedColour = colourOption ? selectedOptions[colourOption.name] : null
  const colourImages = (
    selectedColour
      ? product.variants.filter((v: any) => variantHasValues(v, [selectedColour])).map((v: any) => v.imageUrl)
      : product.variants?.map((v: any) => v.imageUrl)
  ).filter(Boolean) as string[]
  const variantImage = activeVariant?.imageUrl || colourImages[0] || product.images?.[0] || null
  const [pickedImage, setPickedImage] = useState<{ key: string; url: string } | null>(null)
  const activeImageUrl = pickedImage && pickedImage.key === variantKey ? pickedImage.url : variantImage

  const price = activeVariant?.price ?? product.price ?? 0
  const compareAtPrice = activeVariant?.compareAtPrice ?? product.compareAtPrice
  const onSale = compareAtPrice !== null && compareAtPrice !== undefined && compareAtPrice > price
  const stock = activeVariant?.stockCount ?? product.stockCount ?? 0
  const soldOut = stock <= 0
  const variantLabel = activeVariant && activeVariant.name !== "Default" ? activeVariant.name : null

  const allImages = Array.from(new Set([
    ...(colourImages.length ? colourImages : product.images || []),
    ...(colourImages.length ? [] : product.variants?.map((v: any) => v.imageUrl).filter(Boolean) || []),
  ])) as string[]

  function selectOption(optName: string, value: string) {
    setPickedImage(null)
    setSelectedOptions((prev) => {
      const next = { ...prev, [optName]: value }
      const wanted = (product.options || []).map((opt: any) => next[opt.name]).filter(Boolean)
      const exact = product.variants.find((v: any) => variantHasValues(v, wanted))
      if (exact) return optionsFromVariant(exact, product.options, next)
      const any = product.variants.find((v: any) => variantHasValues(v, [value]))
      if (any) return optionsFromVariant(any, product.options, next)
      return next
    })
    if (typeof document !== "undefined") {
      document.getElementById("product-photo")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
  const saleLive = blackFridayIsLive(store)
  const saved = onSale ? compareAtPrice - price : 0
  const percentOff = onSale && compareAtPrice > 0 ? Math.round((1 - price / compareAtPrice) * 100) : 0

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
  const cartVariantId = activeVariant?.id ?? product.id
  const inBag = cart.items.find((i) => i.variantId === cartVariantId)?.quantity ?? 0
  const available = Math.max(0, stock - inBag)
  const qty = Math.min(quantity, Math.max(1, available))
  const [stockNote, setStockNote] = useState<string | null>(null)

  const handleAddToCart = () => {
    if (soldOut) return
    if (available <= 0) {
      setStockNote(`You already have all ${stock} in your bag.`)
      cart.openDrawer()
      return
    }
    const added = cart.addItem({
      variantId: cartVariantId,
      productId: product.id,
      name: variantLabel ? `${product.name} - ${variantLabel}` : product.name,
      price: price,
      quantity: qty,
      imageUrl: activeImageUrl || product.images?.[0],
      maxQuantity: stock,
    })
    setStockNote(added < qty ? `Only ${stock} available — your bag has the most you can order.` : null)
    setQuantity(1)
    cart.openDrawer()
  }

  const { isFavorite, toggleFavorite } = useFavorites()
  const isFaved = isFavorite(product.id)

  const buildWhatsappHref = (pageUrl?: string) =>
    `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
      `Hi ${store.name}, I'd like to order ${qty} x ${product.name}${variantLabel ? ` (${variantLabel})` : ""} at ${money(store.currency, price)}.${
        pageUrl ? `\n${pageUrl}` : ""
      }`
    )}`
  const whatsappHref = store.whatsappNumber ? buildWhatsappHref() : null

  const deliveryText = store.deliveryPolicy || "The delivery fee is paid to the rider when your order arrives. Message us for delivery times to your area."

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-6 md:px-8 md:pt-10">
      <nav className="store-kicker mb-8 md:mb-12">
        <Link href={`${basePath}/`} className="hover:text-[var(--store-ink)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`${basePath}/products`} className="hover:text-[var(--store-ink)]">The collection</Link>
        {product.categories?.[0] && (
          <>
            <span className="mx-2">/</span>
            <Link href={`${basePath}/categories/${product.categories[0].slug}`} className="hover:text-stone-900">{product.categories[0].name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10">
        <div>
          <div id="product-photo" className="relative -mx-5 scroll-mt-24 bg-black md:mx-0">
            {activeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImageUrl}
                alt={product.name}
                className="mx-auto h-[min(48vh,520px)] w-auto max-w-full object-contain"
              />
            ) : (
              <div className="flex h-[min(48vh,520px)] items-center justify-center font-display text-2xl italic text-white/40">
                {product.name}
              </div>
            )}
            {saleLive && onSale && (
              <div className="flex items-center justify-between gap-4 bg-[var(--store-gold)] px-4 py-3 text-[#f7f3ec] md:px-5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em]">{store.name}</p>
                  {onSale ? (
                    <p className="mt-0.5 text-sm font-semibold md:text-base">Save {money(store.currency, saved)}</p>
                  ) : soldOut ? (
                    <p className="mt-0.5 text-sm font-semibold">Sold out</p>
                  ) : (
                    <p className="mt-0.5 text-sm font-semibold">Sale on now</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {saleLive && (
                    <span className="inline-block bg-black px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]">
                      Black Friday
                    </span>
                  )}
                  {percentOff > 0 && (
                    <p className={`text-[11px] uppercase tracking-[0.16em] ${saleLive ? "mt-1" : ""}`}>
                      {percentOff}% off
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {allImages.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setPickedImage({ key: variantKey, url: img })}
                  className={`aspect-[3/4] w-14 shrink-0 overflow-hidden bg-[#efe8dc] md:w-16 ${
                    activeImageUrl === img ? "outline outline-1 outline-offset-2 outline-black" : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Show image ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-2xl min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h1 className="break-words font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">{product.name}</h1>
            <button
              onClick={handleShare}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--store-line)] text-[var(--store-ink)] transition-colors hover:border-[var(--store-ink)]"
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
            <span className={`font-display text-2xl ${onSale ? "text-[var(--store-gold)]" : "text-[var(--store-ink)]"}`}>{money(store.currency, price)}</span>
            {onSale && <span className="text-sm text-stone-400 line-through">{money(store.currency, compareAtPrice)}</span>}
          </div>

          {product.options && product.options.length > 0 ? (
            <div className="mt-8 flex flex-col gap-6 border-t border-[var(--store-line)] pt-8">
              {product.options.map((opt: any) => {
                const isColour = ["color", "colour"].includes(opt.name.toLowerCase())
                return (
                  <div key={opt.id}>
                    <p className="store-kicker mb-3">
                      {opt.name}: <span className="text-[var(--store-ink)]">{selectedOptions[opt.name]}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val: any) => {
                        const isSelected = selectedOptions[opt.name] === val.value
                        const select = () => selectOption(opt.name, val.value)
                        if (isColour) {
                          return (
                            <button
                              key={val.id}
                              onClick={select}
                              title={val.value}
                              aria-label={val.value}
                              className={`h-9 w-9 rounded-full border border-[var(--store-line)] transition ${isSelected ? "ring-1 ring-[var(--store-ink)] ring-offset-2 ring-offset-[var(--store-paper)]" : ""}`}
                              style={{ backgroundColor: val.value.toLowerCase().replace(/ /g, "") }}
                            />
                          )
                        }
                        return (
                          <button
                            key={val.id}
                            onClick={select}
                            className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
                              isSelected ? "border-[var(--store-ink)] bg-[var(--store-ink)] text-[#f7f3ec]" : "border-[var(--store-line)] text-[var(--store-ink)] hover:border-[var(--store-ink)]"
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
            <div className="mt-8 border-t border-[var(--store-line)] pt-8">
              <p className="store-kicker mb-3">
                Option: <span className="text-[var(--store-ink)]">{variantLabel}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant: any) => {
                  const isSelected = activeVariant?.id === variant.id
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setFallbackVariant(variant)}
                      className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
                        isSelected ? "border-[var(--store-ink)] bg-[var(--store-ink)] text-[#f7f3ec]" : "border-[var(--store-line)] text-[var(--store-ink)] hover:border-[var(--store-ink)]"
                      }`}
                    >
                      {variant.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, qty - 1))}
              className="text-lg leading-none text-[var(--store-muted)] hover:text-[var(--store-ink)]"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-5 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQuantity(Math.min(Math.max(1, available), qty + 1))}
              disabled={qty >= available}
              className="text-lg leading-none text-[var(--store-muted)] hover:text-[var(--store-ink)] disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {whatsappHref && (
            <a
              href={whatsappHref}
              onClick={(e) => { e.currentTarget.href = buildWhatsappHref(window.location.href) }}
              target="_blank"
              rel="noreferrer"
              className="store-btn-ghost mt-3 h-13 w-full"
            >
              {soldOut ? "Ask about restock on WhatsApp" : "Order on WhatsApp"}
            </a>
          )}

          <p className="mt-5 text-sm text-stone-500">
            {stock > 5 && "In stock."}
            {stock > 0 && stock <= 5 && `Only ${stock} left.`}
            {inBag > 0 && !soldOut && ` ${inBag} already in your bag.`}
            {soldOut && (whatsappHref ? "Sold out for now. Message the seller to ask about restock." : "Sold out for now.")}
          </p>

          {stockNote && <p className="mt-2 text-sm text-[var(--store-accent)]">{stockNote}</p>}

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

          <div className="mt-8 divide-y divide-[var(--store-line)] border-y border-[var(--store-line)]">
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

      <section id="reviews" className="mt-20 scroll-mt-28 border-t border-[var(--store-line)] pt-16 md:mt-28">
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
              className="store-btn-ghost"
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
              <figure key={review.id} className="border-t border-[var(--store-line)] pt-6">
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
        <section className="mt-20 border-t border-[var(--store-line)] pt-16 md:mt-28">
          <h2 className="mb-8 text-center font-display text-4xl">See it in motion</h2>
          <div className="mx-auto max-w-3xl overflow-hidden bg-stone-950">
            <video src={product.videoUrl} controls className="aspect-video h-auto w-full object-contain" preload="metadata">
              Your browser does not support the video tag.
            </video>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t border-[var(--store-line)] pt-10 md:mt-20">
          <h2 className="mb-5 text-[13px] font-medium tracking-tight text-[var(--store-ink)]">You might also like</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {related.map((item) => {
              const image = item.variants?.[0]?.imageUrl || item.images?.[0]
              const price = item.variants?.[0]?.price ?? item.price ?? 0
              return (
                <Link key={item.id} href={`${basePath}/product/${item.id}`} className="w-[104px] shrink-0 md:w-[120px]">
                  <div className="aspect-[3/4] overflow-hidden bg-[#efe8dc]">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-[var(--store-ink)]">{money(store.currency, price)}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 bg-[#f7f3ec] px-5 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={() => toggleFavorite(product.id)}
            className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--store-ink)] text-[var(--store-ink)]"
            aria-label={isFaved ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart className={`h-5 w-5 ${isFaved ? "fill-[var(--store-ink)]" : ""}`} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={soldOut}
            className="flex h-12 flex-1 items-center justify-center bg-[var(--store-ink)] text-[11px] uppercase tracking-[0.22em] text-[#f7f3ec] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  )
}
