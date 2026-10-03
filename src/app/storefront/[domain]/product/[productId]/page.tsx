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

  const [basePath, related] = await Promise.all([
    getStorefrontBasePath(domain),
    db.product.findMany({
      where: { storeId: store.id, status: "ACTIVE", visibility: "VISIBLE", id: { not: product.id } },
      include: { variants: { take: 2 } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  return <ProductClient product={product} store={store} basePath={basePath} related={related} />
}
