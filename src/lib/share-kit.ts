import { db } from "@/lib/db"

export const SHARE_FORMATS = {
  story: { width: 1080, height: 1920, label: "WhatsApp Status / Instagram Story" },
  square: { width: 1080, height: 1080, label: "Instagram post" },
} as const

export type ShareFormat = keyof typeof SHARE_FORMATS

export function productPublicUrl(storeSlug: string, productId: string) {
  return `https://${storeSlug}.shopora.space/product/${productId}`
}

export function shareImageUrl(productId: string, format: ShareFormat) {
  return `https://www.shopora.space/api/share/product/${productId}?format=${format}`
}

function formatPrice(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/** Everything a seller needs to post a product: image links, the shop link and a ready caption. */
export async function getShareKit(storeId: string, productId: string) {
  const product = await db.product.findFirst({
    where: { id: productId, storeId },
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      status: true,
      visibility: true,
      variants: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
      store: { select: { name: true, slug: true, currency: true, whatsappNumber: true } },
    },
  })
  if (!product) return null

  const price = product.variants[0]?.price ?? product.price ?? 0
  const link = productPublicUrl(product.store.slug, product.id)
  const caption = [
    `${product.name}`,
    `${formatPrice(product.store.currency, price)}`,
    ``,
    `Order now: ${link}`,
    product.store.whatsappNumber ? `Or send us a message on WhatsApp: ${product.store.whatsappNumber}` : null,
    ``,
    `#${product.store.name.replace(/[^a-z0-9]/gi, "")} #ShopGhana #Accra`,
  ]
    .filter((line) => line !== null)
    .join("\n")

  return {
    productId: product.id,
    name: product.name,
    price,
    priceLabel: formatPrice(product.store.currency, price),
    imageUrl: product.images[0] ?? null,
    isLive: product.status === "ACTIVE" && product.visibility === "VISIBLE",
    link,
    caption,
    images: (Object.keys(SHARE_FORMATS) as ShareFormat[]).map((format) => ({
      format,
      label: SHARE_FORMATS[format].label,
      url: shareImageUrl(product.id, format),
    })),
  }
}
