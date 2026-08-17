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

  const product = await db.product.findUnique({
    where: { 
      id: productId,
      storeId: store.id,
      isActive: true
    },
    include: {
      variants: true,
      categories: true
    }
  })

  if (!product) notFound()

  return <ProductClient product={product} store={store} />
}
