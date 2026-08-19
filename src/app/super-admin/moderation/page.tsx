import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import { ModerationStatusToggle } from "./ModerationClient"

export default async function ModerationPage() {
  const stores = await db.store.findMany({
    include: {
      _count: {
        select: { products: true, orders: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            Platform Moderation
          </h2>
          <p className="text-slate-500 mt-1">Manage all merchant stores, enforce guidelines, and handle suspensions.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">All Stores</CardTitle>
          <p className="text-sm text-slate-500 mt-1">{stores.length} total stores registered on the platform.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Store Details</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4 text-right">Products</th>
                  <th className="px-6 py-4 text-right">Orders</th>
                  <th className="px-6 py-4 text-right">Moderation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No stores have been created yet.
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{store.name}</span>
                          <span className="text-xs font-medium text-slate-500 mt-0.5">{store.slug}.shopora.space</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{store.country}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500">{store._count.products}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">{store._count.orders.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <ModerationStatusToggle storeId={store.id} status={store.status} />
                        </div>
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
