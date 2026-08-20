"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { 
  DollarSign, 
  Store, 
  Users, 
  ShoppingBag,
  AlertTriangle,
  Clock, 
  TrendingUp, 
  Calendar,
  ChevronRight
} from "lucide-react"

interface SuperAdminOverviewClientProps {
  stats: {
    totalSellers: number
    totalCustomers: number
    totalOrders: number
    platformRevenue: number
    pendingApprovals: number
    activeDisputes: number
  }
  recentSellers: Array<{
    id: string
    name: string
    slug: string
    ownerEmail: string
    status: string
    createdAt: string
  }>
  pendingPayments: Array<{
    id: string
    storeName: string
    amount: number
    paymentMethod: string
    reference: string
    createdAt: string
  }>
  chartData: Array<{
    label: string
    amount: number
  }>
}

export function SuperAdminOverviewClient({
  stats,
  recentSellers,
  pendingPayments,
  chartData
}: SuperAdminOverviewClientProps) {
  const router = useRouter()
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
            Platform Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, Super Admin. Here is what's happening on Shopora today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>{timeRange}</span>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Platform Revenue */}
        <div onClick={() => router.push('/super-admin/finance')} className="block h-full cursor-pointer">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-orange-50/20 hover:shadow-md  transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700/80">Platform Revenue</span>
                <div className="w-10 h-10 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-700">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
                  GHS {stats.platformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs font-medium text-amber-700/80 mt-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Subscription earnings</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 2: Total Sellers */}
        <div onClick={() => router.push('/super-admin/sellers')} className="block h-full cursor-pointer">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/50 hover:shadow-md  transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Sellers</span>
                <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalSellers}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  Active storefronts on platform
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 3: Total Customers */}
        <div onClick={() => router.push('/super-admin/customers')} className="block h-full cursor-pointer">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/10 hover:shadow-md  transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700/80">Total Customers</span>
                <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-700">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalCustomers}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  Registered platform users
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 4: Total Orders */}
        <div onClick={() => router.push('/super-admin/analytics')} className="block h-full cursor-pointer">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50/40 to-indigo-100/10 hover:shadow-md  transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700/80">Total Orders</span>
                <div className="w-10 h-10 rounded-full bg-indigo-100/80 flex items-center justify-center text-indigo-700">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalOrders}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  Across all platform stores
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 5: Pending Approvals */}
        <div onClick={() => router.push('/super-admin/waitlist')} className="block h-full cursor-pointer">
          <Card className={`border-0 shadow-sm bg-gradient-to-br hover:shadow-md  transition-all cursor-pointer h-full ${stats.pendingApprovals > 0 ? 'from-orange-50/50 to-orange-100/10' : 'from-emerald-50/40 to-emerald-100/10'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${stats.pendingApprovals > 0 ? 'text-orange-700/80' : 'text-emerald-700/80'}`}>Pending Approvals</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.pendingApprovals > 0 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.pendingApprovals}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  Stores/Payments awaiting review
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 6: Active Disputes */}
        <div onClick={() => router.push('/super-admin/moderation')} className="block h-full cursor-pointer">
          <Card className={`border-0 shadow-sm bg-gradient-to-br hover:shadow-md  transition-all cursor-pointer h-full ${stats.activeDisputes > 0 ? 'from-red-50/50 to-red-100/10' : 'from-slate-50 to-slate-100/50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${stats.activeDisputes > 0 ? 'text-red-700/80' : 'text-slate-500'}`}>Active Disputes</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.activeDisputes > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.activeDisputes}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  Disputes requiring attention
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales Chart and Pending Payments Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center px-6 py-5 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Platform Revenue Overview</CardTitle>
            </div>
            <span className="text-lg font-extrabold text-slate-900">
              GHS {stats.platformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  No subscription payments recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Bank Transfers/Payments */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Pending Subscriptions</CardTitle>
            <Button variant="ghost" size="sm" className="text-slate-500 font-bold hover:text-slate-900" onClick={() => window.location.href=`/super-admin/subscriptions`}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {pendingPayments.length > 0 ? (
                pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{payment.storeName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Method: {payment.paymentMethod} • Ref: {payment.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-950">GHS {payment.amount.toFixed(2)}</p>
                      <Badge variant="secondary" className="text-[10px] font-bold mt-1 uppercase tracking-wider bg-orange-50 text-orange-700">
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No pending subscriptions.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Sellers */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900">Recent Storefronts</CardTitle>
          <Button variant="ghost" size="sm" className="text-slate-500 font-bold hover:text-slate-900" onClick={() => window.location.href=`/super-admin/sellers`}>
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Store Name</th>
                  <th className="px-6 py-4">Subdomain</th>
                  <th className="px-6 py-4">Owner Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSellers.length > 0 ? (
                  recentSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{seller.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500">{seller.slug}.shopora.space</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{seller.ownerEmail}</td>
                      <td className="px-6 py-4">
                        <Badge variant={seller.status === "ACTIVE" ? "default" : "destructive"} className="font-bold px-2 py-0.5 border-0">
                          {seller.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{seller.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No storefronts created yet.
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
