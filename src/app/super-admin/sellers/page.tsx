import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function SellersPage() {
  const stores = await db.store.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        where: { role: "OWNER" },
        include: { user: true }
      },
      _count: {
        select: { products: true, orders: true }
      }
    }
  });

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Sellers</h1>
        <p className="text-slate-500 mt-2">Manage all storefronts and their owners.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sellers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Store Name</th>
                  <th className="px-6 py-4 font-medium">Subdomain</th>
                  <th className="px-6 py-4 font-medium">Owner Email</th>
                  <th className="px-6 py-4 font-medium">Products</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No sellers found on the platform yet.
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{store.name}</td>
                      <td className="px-6 py-4">{store.slug}.shopora.space</td>
                      <td className="px-6 py-4">
                        {store.members[0]?.user?.email || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{store._count.products}</td>
                      <td className="px-6 py-4">
                        <Badge variant={store.status === "ACTIVE" ? "default" : "destructive"}>
                          {store.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm">
                          Suspend
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
  );
}
