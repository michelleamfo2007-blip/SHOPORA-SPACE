import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Plus } from "lucide-react"

export default async function ProductsPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({
    where: { id: storeId },
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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-amber-500" />
            Products
          </h2>
          <p className="text-slate-500 mt-1">Manage your store's products and inventory.</p>
        </div>
        <Link href={`/${store.id}/products/new`}>
          <Button className="bg-slate-900 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">All Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Inventory</th>
                  <th className="px-6 py-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {store.products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No products found. Add your first product!
                    </td>
                  </tr>
                ) : (
                  store.products.map((product) => {
                    const totalStock = product.variants.reduce((acc, v) => acc + v.stockCount, 0)
                    const price = product.variants[0]?.price || 0
                    
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                        <td className="px-6 py-4">
                          <Link href={`/${store.id}/products/${product.id}`} className="block">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/${store.id}/products/${product.id}`} className="block">
                            {product.isActive ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                Draft
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/${store.id}/products/${product.id}`} className="block font-semibold text-slate-600">
                            {totalStock} in stock
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/${store.id}/products/${product.id}`} className="block font-extrabold text-slate-900">
                            {store.currency} {price.toFixed(2)}
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
