import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createProductAction } from "@/server/actions/product"

export default async function NewProductPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  return (
    <div className="grid gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
          <p className="text-slate-500">Create a new product for your store.</p>
        </div>
        <Link href={`/${storeId}/products`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <form action={createProductAction} className="grid gap-6">
        {/* Hidden input to pass the storeId to the server action */}
        <input type="hidden" name="storeId" value={storeId} />

        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>The core information about your product.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" placeholder="E.g. Vintage Leather Jacket" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe your product's features, benefits, and details..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input id="sku" name="sku" placeholder="E.g. JKT-VNTG-01" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stockCount">Stock Quantity</Label>
                <Input id="stockCount" name="stockCount" type="number" min="0" defaultValue="0" required />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
            <CardDescription>Determine if this product is visible to customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" name="isActive" defaultChecked />
              <Label htmlFor="isActive">Active (Visible on Storefront)</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit">Save Product</Button>
        </div>
      </form>
    </div>
  )
}
