import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductForm } from "./ProductForm"

export default async function NewProductPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  return (
    <div className="grid gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
          <p className="text-slate-500">Create a new product for your store.</p>
        </div>
        <Link href={`/${storeId}/products`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <ProductForm storeId={storeId} />
    </div>
  )
}
