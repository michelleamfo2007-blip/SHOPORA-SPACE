import { db } from "@/lib/db"
import type { FeaturedStorefront } from "@/components/marketing/mockups"

const PRODUCTS_NEEDED = 4
const PREFERRED_SLUG = "shimmerjewels"

/** Picks a live store with real product photos to show inside the landing page browser mockup. */
export async function getFeaturedStorefront(): Promise<FeaturedStorefront | null> {
  try {
    const stores = await db.store.findMany({
      where: {
        status: "ACTIVE",
        products: {
          some: { status: "ACTIVE", visibility: "VISIBLE", price: { not: null }, images: { isEmpty: false } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        name: true,
        slug: true,
        currency: true,
        heroImage: true,
        heroHeadline: true,
        heroSubtext: true,
        description: true,
        announcementText: true,
        products: {
          where: { status: "ACTIVE", visibility: "VISIBLE", price: { not: null }, images: { isEmpty: false } },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: PRODUCTS_NEEDED,
          select: { name: true, price: true, images: true },
        },
      },
    })

    const ranked = stores
      .map((store) => ({
        store,
        score:
          (store.slug === PREFERRED_SLUG ? 100 : 0) +
          Math.min(store.products.length, PRODUCTS_NEEDED) * 2 +
          (store.heroImage ? 3 : 0),
      }))
      .filter(({ store }) => store.products.length >= 3 || (store.heroImage && store.products.length >= 2))
      .sort((a, b) => b.score - a.score)

    const pick = ranked[0]?.store
    if (!pick) return null

    const products = pick.products.map((p) => ({
      name: p.name,
      price: `${pick.currency || "GHS"} ${Number(p.price).toLocaleString("en-GH", { maximumFractionDigits: 2 })}`,
      image: p.images[0],
    }))
    const heroImage = pick.heroImage || products[0].image
    const grid = (pick.heroImage ? products : products.slice(1)).slice(0, 3)

    return {
      name: pick.name,
      domain: `${pick.slug}.shopora.space`,
      announcement: pick.announcementText,
      headline: pick.heroHeadline || "New arrivals",
      subtext: pick.heroSubtext || pick.description,
      heroImage,
      products: grid,
    }
  } catch (error) {
    console.error("Featured storefront failed to load", error)
    return null
  }
}
