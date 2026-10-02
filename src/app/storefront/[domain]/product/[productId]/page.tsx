import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { getStorefrontBasePath } from "@/lib/storefront"
import { ProductClient } from "./ProductClient"

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ domain: string; productId: string }> 
}) {
  const { domain, productId } = await params;
  const store = await getStoreByHost(domain)
  if (!store) notFound()

  const product = await db.product.findFirst({
    where: { 
      id: productId,
      storeId: store.id,
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
