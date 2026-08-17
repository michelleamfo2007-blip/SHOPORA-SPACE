import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function ProductsPage({ params }: { params: { storeId: string } }) {
  const store = await db.store.findUnique({
    where: { id: params.storeId },
    include: {
      products: {
        include: {
          variants: true,
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!store) return null

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-slate-500">Manage your store's products and inventory.</p>
        </div>
        <Link href={`/${store.id}/products/new`}>
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {store.products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No products found. Add your first product!
                </TableCell>
              </TableRow>
            ) : (
              store.products.map((product) => {
                const totalStock = product.variants.reduce((acc, v) => acc + v.stockCount, 0)
                const price = product.variants[0]?.price || 0
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{totalStock} in stock</TableCell>
                    <TableCell className="text-right">
                      {store.currency} {price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
