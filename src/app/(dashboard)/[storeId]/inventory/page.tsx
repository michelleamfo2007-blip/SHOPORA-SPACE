import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowUpRight, CheckCircle2, Box } from "lucide-react"

export default async function InventoryPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  
  const products = await db.product.findMany({
    where: { storeId },
    include: {
      variants: {
        include: {
          optionValues: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Flatten products into variants for the inventory view
  const variants = products.flatMap((p: any) => 
    (p.variants as any[]).map((v: any) => ({
      ...v,
      productName: p.name,
      status: p.isActive ? "Active" : "Draft"
    }))
  )

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Box className="w-8 h-8 text-indigo-500" />
            Inventory
          </h2>
          <p className="text-slate-500 mt-1">Track and adjust stock levels across all your product variants.</p>
        </div>
        <Button className="bg-slate-900 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-slate-800 transition-colors shadow-sm">
          Update Stock
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Variant Details</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Available Stock</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No inventory items found. Add products to manage stock.
                    </td>
                  </tr>
                ) : (
                  variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {variant.productName}
                      </td>
                      <td className="px-6 py-4">
                        {variant.optionValues.length > 0 ? (
                          <span className="font-semibold text-slate-600">
                            {variant.optionValues.map((ov: any) => ov.value).join(" / ")}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Default</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500 text-xs tracking-wider">
                        {variant.sku || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {variant.status === "Active" ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {variant.stockCount <= 0 ? (
                            <Badge variant="destructive" className="font-bold">Out of Stock</Badge>
                          ) : variant.stockCount <= 5 ? (
                            <Badge variant="default" className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold">Low Stock: {variant.stockCount}</Badge>
                          ) : (
                            <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {variant.stockCount}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 transition-colors">
                          <span className="sr-only">Edit</span>
                          <ArrowUpRight className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
