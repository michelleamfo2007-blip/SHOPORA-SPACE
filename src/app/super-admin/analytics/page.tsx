import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Store, ShoppingCart, Users, Package, Trophy } from "lucide-react"

export default async function AnalyticsPage() {
  // Aggregate totals
  const totalStores = await db.store.count()
  const totalOrders = await db.order.count()
  const totalCustomers = await db.customer.count()
  const totalProducts = await db.product.count()

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
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Analytics</h1>
        <p className="text-slate-500 mt-2">Global metrics and top-performing merchants across Shopora Space.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Active merchant storefronts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Processed across all stores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Unique buyers platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Items listed for sale</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> 
            Top Performing Stores
          </CardTitle>
          <CardDescription>
            The top 10 most active merchants on the platform based on order volume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Store Details</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      Not enough data to display top stores.
                    </TableCell>
                  </TableRow>
                ) : (
                  topStores.map((store, index) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium text-slate-500">
                        #{index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{store.name}</span>
                          <span className="text-xs text-slate-500">{store.slug}.shopora.space</span>
                        </div>
                      </TableCell>
                      <TableCell>{store.country}</TableCell>
                      <TableCell className="text-right font-mono">{store._count.products}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        {store._count.orders.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
