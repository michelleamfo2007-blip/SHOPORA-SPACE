"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Eye, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  TrendingDown
} from "lucide-react"

interface DashboardOverviewClientProps {
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
  const [timeRange, setTimeRange] = useState("Last 7 Days")

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-500 mt-1">
            Here is what's happening with your store ({storeName}) today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>{timeRange}</span>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Total Revenue */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-orange-50/20 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700/80">Total Revenue</span>
              <div className="w-10 h-10 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-700">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {currency} {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs font-medium text-amber-700/80 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+0.0% from last week</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Orders */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/50 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Orders</span>
              <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalOrders}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+0.0% from last week</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Products */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-stone-50 to-orange-50/10 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800/80">Total Products</span>
              <div className="w-10 h-10 rounded-full bg-amber-100/40 flex items-center justify-center text-amber-900/80">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalProducts}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1.5">
                Active listings in store
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Low Stock Items */}
        <Card className={`border-0 shadow-sm bg-gradient-to-br hover:shadow-md transition-shadow ${stats.lowStockCount > 0 ? 'from-red-50/50 to-red-100/10' : 'from-emerald-50/40 to-emerald-100/10'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${stats.lowStockCount > 0 ? 'text-red-700/80' : 'text-emerald-700/80'}`}>Low Stock Items</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.lowStockCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-extrabold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.lowStockCount}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1.5">
                {stats.lowStockCount > 0 ? "Requires attention" : "Inventory levels healthy"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Site Views */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/10 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700/80">Site Views</span>
              <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-700">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.siteViews}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1.5">
                Total storefront views
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart and Order Summary Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center px-6 py-5 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Sales Overview</CardTitle>
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
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
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
                      stroke="#d97706"
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
            
            <Button variant="outline" className="w-full mt-6 py-5 rounded-xl font-bold" onClick={() => window.location.href=`/[storeId]/orders`}>
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
            <Button variant="ghost" size="sm" className="text-slate-500 font-bold hover:text-slate-900" onClick={() => window.location.href=`/[storeId]/orders`}>
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
                  <th className="px-6 py-4">Revenue Generated</th>
                  <th className="px-6 py-4">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bestSellers.length > 0 ? (
                  bestSellers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          {item.image ? (
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
                      <td className="px-6 py-4 font-bold text-slate-950">{currency} {item.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 border-0 flex items-center gap-1 w-fit">
                          <TrendingUp className="w-3 h-3" />
                          <span>Up this week</span>
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
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
