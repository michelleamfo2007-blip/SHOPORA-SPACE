import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, ShoppingCart, Users, Package, Trophy, BarChart3 } from "lucide-react"

export default async function AnalyticsPage() {
  // Aggregate totals
  const totalStores = await db.store.count()
  const totalOrders = await db.order.count()
  const totalCustomers = await db.customer.count()
  const totalProducts = await db.product.count()

  // Platform Analytics (Main Website)
  const platformStats = await db.platformAnalytics.aggregate({
    _sum: {
      pageViews: true,
      visitors: true,
    }
  })
  
  const platformViews = platformStats._sum.pageViews || 0
  const platformVisitors = platformStats._sum.visitors || 0

  // Get Top 10 stores by order count
  const topStores = await db.store.findMany({
    include: {
      _count: {
        select: { orders: true, products: true }
      }
    },
    orderBy: {
      orders: {
        _count: 'desc'
      }
    },
    take: 10
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-cyan-500" />
            Platform Analytics
          </h2>
          <p className="text-slate-500 mt-1">Global metrics and top-performing merchants across Shopora Space.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{totalStores.toLocaleString()}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Active merchant storefronts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{totalOrders.toLocaleString()}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Processed across all stores</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{totalCustomers.toLocaleString()}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Unique buyers platform-wide</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{totalProducts.toLocaleString()}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Items listed for sale</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Main Website Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{platformViews.toLocaleString()}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Total page views on landing pages</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Main Website Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{platformVisitors.toLocaleString()}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Unique daily visitors</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> 
            Top Performing Stores
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">The top 10 most active merchants on the platform based on order volume.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Store Details</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Products</th>
                  <th className="px-6 py-4 text-right">Total Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topStores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      Not enough data to display top stores.
                    </td>
                  </tr>
                ) : (
                  topStores.map((store, index) => (
                    <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{store.name}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{store.slug}.shopora.space</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{store.country}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500">{store._count.products}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          {store._count.orders.toLocaleString()}
                        </span>
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
