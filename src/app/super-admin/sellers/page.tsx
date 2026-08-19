import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Store className="w-8 h-8 text-blue-500" />
            Platform Sellers
          </h2>
          <p className="text-slate-500 mt-1">Manage all storefronts and their owners.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">All Sellers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
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
                    <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{store.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{store.slug}.shopora.space</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {store.members[0]?.user?.email || "Unknown"}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{store._count.products}</td>
                      <td className="px-6 py-4">
                        {store.status === "ACTIVE" ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
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
