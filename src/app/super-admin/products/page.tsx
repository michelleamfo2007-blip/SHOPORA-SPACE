import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: true,
      variants: true
    },
    take: 100
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-emerald-500" />
            Platform Products
          </h2>
          <p className="text-slate-500 mt-1">Monitor and manage products listed across all stores.</p>
        </div>
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
                  <th className="px-6 py-4 font-medium">Product Name</th>
                  <th className="px-6 py-4 font-medium">Store</th>
                  <th className="px-6 py-4 font-medium">Base Price</th>
                  <th className="px-6 py-4 font-medium">Variants</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No products listed on the platform yet.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const basePrice = product.variants[0]?.price || 0;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{product.store.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">₵{basePrice.toFixed(2)}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{product.variants.length}</td>
                        <td className="px-6 py-4">
                          {product.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                              Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm" className="font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                            Take Down
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
