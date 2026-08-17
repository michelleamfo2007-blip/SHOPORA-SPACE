import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, CreditCard, Activity } from "lucide-react"

export default async function FinancePage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // 1. Calculate Gross Merchandise Value (GMV)
  const allOrders = await db.order.findMany({
    select: { totalAmount: true, createdAt: true, status: true },
    where: { status: { notIn: ["CANCELLED", "REFUNDED", "PENDING"] } }
  })

  const totalGMV = allOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const thisMonthOrders = allOrders.filter(order => order.createdAt >= startOfMonth)
  const monthlyGMV = thisMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  // 2. Calculate Platform Monthly Recurring Revenue (MRR) from Subscriptions
  const activeSubscriptions = await db.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: { plan: true, store: true }
  })

  const mrr = activeSubscriptions.reduce((sum, sub) => sum + sub.plan.price, 0)

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Finance</h1>
        <p className="text-slate-500 mt-2">Overview of platform revenue and global merchant volume (GMV).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform GMV</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGMV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500">Total volume across all stores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly GMV</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyGMV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500">Volume this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform MRR</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500">From active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-slate-500">Stores paying for Shopora</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Store Subscriptions</CardTitle>
          <CardDescription>
            List of stores currently paying a platform subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing Interval</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      No active subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.store.name}
                        <div className="text-xs font-normal text-slate-500">{sub.store.slug}.shopora.space</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub.plan.name}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{sub.plan.interval}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${sub.plan.price.toFixed(2)}
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
