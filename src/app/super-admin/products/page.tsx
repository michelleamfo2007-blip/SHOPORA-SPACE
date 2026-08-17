import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Products</h1>
        <p className="text-slate-500 mt-2">Monitor and manage products listed across all stores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
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
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                        <td className="px-6 py-4 text-slate-500">{product.store.name}</td>
                        <td className="px-6 py-4 font-medium">${basePrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-500">{product.variants.length}</td>
                        <td className="px-6 py-4">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Hidden"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm">
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
