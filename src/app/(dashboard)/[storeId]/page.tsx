import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

export default async function DashboardOverview({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  // Fetch overview stats (mocked for now, will connect to real data in Phase 3/5)
  const store = await db.store.findUnique({
    where: { id: storeId },
  })

  if (!store) return null

  // Calculate stats
  const totalRevenueAggregation = await db.order.aggregate({
    where: { storeId },
    _sum: { totalAmount: true }
  })
  const totalRevenue = totalRevenueAggregation._sum.totalAmount || 0

  const totalOrders = await db.order.count({ where: { storeId } })
  const totalProducts = await db.product.count({ where: { storeId } })
  const totalCustomers = await db.customer.count({ where: { storeId } })

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-slate-500">Welcome back to {store?.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store?.currency} {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-500">Lifetime revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-slate-500">Total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-slate-500">Active items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-slate-500">Total customers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
