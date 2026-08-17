import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createVariantAction } from "@/server/actions/variant"

export default async function ProductEditPage({ 
  params 
}: { 
  params: { storeId: string; productId: string } 
}) {
  const product = await db.product.findUnique({
    where: { id: params.productId, storeId: params.storeId },
    include: { variants: true }
  })

  if (!product) return <div>Product not found</div>

  return (
    <div className="grid gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-slate-500">{product.name}</p>
        </div>
        <Link href={`/${params.storeId}/products`}>
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Variants & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.name}</TableCell>
                        <TableCell>{variant.sku || "-"}</TableCell>
                        <TableCell>{variant.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{variant.stockCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Add Variant</h3>
                <form action={createVariantAction} className="grid gap-4">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="storeId" value={params.storeId} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Variant Name (e.g. Size L, Red)</Label>
                      <Input name="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Price</Label>
                      <Input name="price" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>SKU</Label>
                      <Input name="sku" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Stock Quantity</Label>
                      <Input name="stockCount" type="number" required defaultValue="0" />
                    </div>
                  </div>
                  <Button type="submit">Add Variant</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
