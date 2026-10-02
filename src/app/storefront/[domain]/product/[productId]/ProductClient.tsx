"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Heart, Minus, Plus } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"
import { ProductCard } from "@/components/storefront/ProductCard"

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type ProductClientProps = {
  product: any
  store: any
  basePath: string
  related: any[]
}

export function ProductClient({ product, store, basePath, related }: ProductClientProps) {
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
  const variantLabel = activeVariant && activeVariant.name !== "Default" ? activeVariant.name : null

  const allImages = Array.from(new Set([
    ...(product.images || []),
    ...(product.variants?.map((v: any) => v.imageUrl).filter(Boolean) || [])
  ])) as string[]

  const cart = useCart()

  const handleAddToCart = () => {
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
        <Link href={`${basePath}/products`} className="hover:text-stone-900">Shop</Link>
        {product.categories?.[0] && (
          <>
            <span className="mx-2">/</span>
            <Link href={`${basePath}/categories/${product.categories[0].slug}`} className="hover:text-stone-900">{product.categories[0].name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="flex min-w-0 flex-col-reverse gap-4 self-start lg:flex-row">
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
            {onSale && (
              <span className="absolute left-4 top-4 bg-[#faf8f5] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]">Sale</span>
            )}
          </div>
        </div>

        <div className="min-w-0 md:sticky md:top-28 md:self-start">
          <h1 className="break-words font-display text-4xl leading-tight tracking-tight md:text-5xl">{product.name}</h1>

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
              className="h-13 flex-1 rounded-full bg-[var(--store-accent)] text-sm tracking-wide text-white transition-opacity hover:opacity-90"
            >
              Add to bag
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
              Order on WhatsApp
            </a>
          )}

          <p className="mt-5 text-sm text-stone-500">
            {stock > 5 && "In stock and ready to order."}
            {stock > 0 && stock <= 5 && `Only ${stock} left.`}
            {stock <= 0 && (whatsappHref ? "Message the seller to check availability." : "Contact the seller to check availability.")}
          </p>

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
          className="h-12 rounded-full bg-[var(--store-accent)] px-7 text-sm tracking-wide text-white"
        >
          Add to bag
        </button>
      </div>
    </div>
  )
}
