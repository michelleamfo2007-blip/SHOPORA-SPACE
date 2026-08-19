import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ProductForm } from "../new/ProductForm"

export default async function ProductEditPage({ 
  params 
}: { 
  params: Promise<{ storeId: string; productId: string }> 
}) {
  const { storeId, productId } = await params;
  const product = await db.product.findUnique({
    where: { id: productId, storeId: storeId },
    include: { 
      variants: true,
      options: {
        include: { values: true }
      }
    }
  })

  if (!product) return <div>Product not found</div>

  return (
    <div className="grid gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-slate-500">Make changes to {product.name}</p>
        </div>
        <Link href={`/${storeId}/products`}>
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      <ProductForm storeId={storeId} initialData={product} />
    </div>
  )
}
