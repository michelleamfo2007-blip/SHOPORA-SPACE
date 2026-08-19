import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, CreditCard, Activity, Coins } from "lucide-react"

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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Coins className="w-8 h-8 text-teal-500" />
            Platform Finance
          </h2>
          <p className="text-slate-500 mt-1">Overview of platform revenue and global merchant volume (GMV).</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Platform GMV</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">₵{totalGMV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Total volume across all stores</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Monthly GMV</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">₵{monthlyGMV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Volume this month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Platform MRR</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">₵{mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">From active subscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{activeSubscriptions.length}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Stores paying for Shopora</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Active Store Subscriptions</CardTitle>
          <p className="text-sm text-slate-500 mt-1">List of stores currently paying a platform subscription.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Billing Interval</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No active subscriptions found.
                    </td>
                  </tr>
                ) : (
                  activeSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{sub.store.name}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{sub.store.slug}.shopora.space</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          {sub.plan.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 capitalize">{sub.plan.interval}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ₵{sub.plan.price.toFixed(2)}
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
