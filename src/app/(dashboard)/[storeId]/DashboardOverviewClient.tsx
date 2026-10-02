"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Eye
} from "lucide-react"

interface DashboardOverviewClientProps {
  storeId: string
  storeName: string
  userName: string
  currency: string
  stats: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    lowStockCount: number
    siteViews: number
  }
  orderSummary: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    refunded: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    totalAmount: number
    createdAt: string
  }>
  lowStockItems: Array<{
    id: string
    name: string
    stockCount: number
    sku: string | null
  }>
  bestSellers: Array<{
    id: string
    name: string
    image: string | null
    unitsSold: number
    revenue: number
  }>
  chartData: Array<{
    label: string
    amount: number
  }>
}

export function DashboardOverviewClient({
  storeId,
  storeName,
  userName,
  currency,
  stats,
  orderSummary,
  recentOrders,
  lowStockItems,
  bestSellers,
  chartData
}: DashboardOverviewClientProps) {
  const router = useRouter()

  // Generate SVG path for smooth bezier curve chart
  const generateSvgPath = (data: Array<{ amount: number }>, width: number, height: number, closePath: boolean = false) => {
    if (data.length === 0) return ""
    const maxVal = Math.max(...data.map(d => d.amount), 10)
    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - (d.amount / maxVal) * (height - 30) - 15
      return { x, y }
    })

    let path = `M ${points[0].x} ${points[0].y}`
    
    // Draw smooth bezier curve
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cpX1 = p0.x + (p1.x - p0.x) / 3
      const cpY1 = p0.y
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3
      const cpY2 = p1.y
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`
    }

    if (closePath) {
      path += ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    }

    return path
  }

  const svgWidth = 500
  const svgHeight = 200

  return (
    <div className="space-y-8 pb-10">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-stone-500">
          {storeName}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Revenue", value: `${currency} ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign },
          { label: "Orders", value: String(stats.totalOrders), icon: ShoppingBag },
          { label: "Products", value: String(stats.totalProducts), icon: Package },
          { label: "Low stock", value: String(stats.lowStockCount), icon: AlertTriangle, warn: stats.lowStockCount > 0 },
          { label: "Store views", value: String(stats.siteViews), icon: Eye },
        ].map((item) => (
          <Card key={item.label} className="border-stone-200 bg-white shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-medium">{item.label}</span>
                <item.icon className="h-4 w-4" />
              </div>
              <p className={`mt-2 text-2xl font-semibold ${item.warn ? "text-red-600" : "text-stone-950"}`}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart and Order Summary Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center px-6 py-5 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-semibold text-stone-950">Sales, last 7 days</CardTitle>
            </div>
            <span className="text-lg font-extrabold text-slate-900">
              {currency} {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative w-full h-[220px] flex items-end">
              {chartData.length > 0 ? (
                <>
                  <svg className="w-full h-[200px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0c0a09" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#0c0a09" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Fill Area */}
                    <path
                      d={generateSvgPath(chartData, svgWidth, svgHeight, true)}
                      fill="url(#chartGradient)"
                    />
                    {/* Border Line */}
                    <path
                      d={generateSvgPath(chartData, svgWidth, svgHeight, false)}
                      fill="none"
                      stroke="#0c0a09"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Labels Row */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {chartData.map((d, index) => (
                      <span key={index}>{d.label}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No sales recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary Tracker */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Item: Pending */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Pending Orders</p>
                    <p className="text-xs text-slate-500">Awaiting processing</p>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900">{orderSummary.pending}</span>
              </div>

              {/* Item: Processing */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Processing</p>
                    <p className="text-xs text-slate-500">Packed for shipment</p>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900">{orderSummary.processing}</span>
              </div>

              {/* Item: Shipped */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Shipped</p>
                    <p className="text-xs text-slate-500">On the way to customer</p>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900">{orderSummary.shipped}</span>
              </div>

              {/* Item: Delivered */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Delivered</p>
                    <p className="text-xs text-slate-500">Successfully received</p>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900">{orderSummary.delivered}</span>
              </div>

              {/* Item: Refunded */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Refunded</p>
                    <p className="text-xs text-slate-500">Payment refunded</p>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900">{orderSummary.refunded}</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-6 py-5 rounded-xl font-bold" onClick={() => router.push(`/${storeId}/orders`)}>
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Recent Orders, Inventory Alerts, Best Sellers */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders table */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white">
          <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="text-slate-500 font-bold hover:text-slate-900" onClick={() => router.push(`/${storeId}/orders`)}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700 max-w-[120px] truncate">{order.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{order.customerName}</td>
                        <td className="px-6 py-4 font-bold text-slate-950">{currency} {order.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="border-0 shadow-sm bg-white flex flex-col">
          <CardHeader className="px-6 py-5 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Inventory Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            {lowStockItems.length > 0 ? (
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-red-50/30 border border-red-100 p-3.5 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">SKU: {item.sku || "N/A"}</p>
                    </div>
                    <Badge variant="destructive" className="font-bold px-2.5 py-1">
                      {item.stockCount} left
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="font-semibold text-slate-600">All stock levels are healthy!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Selling Products row */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="px-6 py-5 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Units Sold</th>
                  <th className="px-6 py-4">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bestSellers.length > 0 ? (
                  bestSellers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 bg-slate-100 font-semibold">
                              IMG
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{item.unitsSold} units</td>
                      <td className="px-6 py-4 font-semibold text-stone-950">{currency} {item.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      No products sold yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
