import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
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

  return <ProductClient product={product} store={store} />
}
