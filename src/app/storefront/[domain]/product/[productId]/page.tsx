import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { getStorefrontBasePath } from "@/lib/storefront"
import { ProductClient } from "./ProductClient"

type Props = { params: Promise<{ domain: string; productId: string }> }

const getProduct = cache((storeId: string, productId: string) =>
  db.product.findFirst({
    where: {
      id: productId,
      storeId,
      status: {
        notIn: ["DRAFT", "ARCHIVED"]
      }
    },
    include: {
      variants: true,
      categories: true,
      options: {
        include: {
          values: true
        }
      }
    }
  })
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, productId } = await params
  const store = await getStoreByHost(domain)
  if (!store) return {}
  const product = await getProduct(store.id, productId)
  if (!product) return {}

  const description = product.description?.replace(/\s+/g, " ").trim().slice(0, 200) || `${product.name} from ${store.name}.`
  const image = product.images[0] || product.variants.find((v) => v.imageUrl)?.imageUrl

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} · ${store.name}`,
      description,
      siteName: store.name,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { domain, productId } = await params;
  const store = await getStoreByHost(domain)
  if (!store) notFound()

  const product = await getProduct(store.id, productId)

  if (!product) notFound()

  const categoryIds = product.categories.map((c) => c.id)
  const [basePath, sameCategory, latest, reviews] = await Promise.all([
    getStorefrontBasePath(domain),
    categoryIds.length
      ? db.product.findMany({
          where: {
            storeId: store.id,
            status: "ACTIVE",
            visibility: "VISIBLE",
            id: { not: product.id },
            categories: { some: { id: { in: categoryIds } } },
          },
          include: { variants: { take: 2 } },
          orderBy: { createdAt: "desc" },
          take: 4,
        })
      : Promise.resolve([]),
    db.product.findMany({
      where: { storeId: store.id, status: "ACTIVE", visibility: "VISIBLE", id: { not: product.id } },
      include: { variants: { take: 2 } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.review.findMany({
      where: { productId: product.id, status: { not: "HIDDEN" } },
      select: { id: true, rating: true, comment: true, createdAt: true, customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  // Prefer items from the same collection, topped up with the newest pieces.
  const related = [...sameCategory, ...latest.filter((p) => !sameCategory.some((s) => s.id === p.id))].slice(0, 4)

  return (
    <ProductClient
      product={product}
      store={store}
      basePath={basePath}
      related={related}
      domain={domain}
      reviews={reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        customerName: r.customer?.name || "Verified customer",
      }))}
    />
  )
}
