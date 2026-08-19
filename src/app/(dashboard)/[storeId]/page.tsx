import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { DashboardOverviewClient } from "./DashboardOverviewClient"

export default async function DashboardOverview({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const store = await db.store.findUnique({
    where: { id: storeId },
  })

  if (!store) return null

  // 1. Fetch main metrics
  const totalRevenueAggregation = await db.order.aggregate({
    where: { storeId },
    _sum: { totalAmount: true }
  })
  const totalRevenue = totalRevenueAggregation._sum.totalAmount || 0

  const totalOrders = await db.order.count({ where: { storeId } })
  const totalProducts = await db.product.count({ where: { storeId } })

  // Calculate low stock items count
  const lowStockCount = await db.product.count({
    where: {
      storeId,
      stockCount: {
        lte: 10
      }
    }
  })

  // Calculate site views from StoreAnalytics
  const analyticsSum = await db.storeAnalytics.aggregate({
    where: { storeId },
    _sum: { pageViews: true }
  })
  const siteViews = analyticsSum._sum.pageViews || 0

  // 2. Fetch order summary status
  const orders = await db.order.findMany({
    where: { storeId },
    select: { status: true }
  })

  const orderSummary = {
    pending: orders.filter(o => o.status === "PENDING" || o.status === "PENDING_VERIFICATION").length,
    processing: orders.filter(o => o.status === "PROCESSING").length,
    shipped: orders.filter(o => o.status === "SHIPPED").length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    refunded: orders.filter(o => o.status === "REFUNDED").length,
  }

  // 3. Fetch 5 most recent orders with customer names
  const recentOrdersData = await db.order.findMany({
    where: { storeId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  const recentOrders = recentOrdersData.map(order => ({
    id: order.orderNumber || order.id,
    customerName: order.customer.name || "Customer",
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toLocaleDateString(),
  }))

  // 4. Fetch low stock items list
  const lowStockItemsData = await db.product.findMany({
    where: {
      storeId,
      stockCount: {
        lte: 10
      }
    },
    select: {
      id: true,
      name: true,
      stockCount: true,
      sku: true
    },
    take: 5
  })

  const lowStockItems = lowStockItemsData.map(item => ({
    id: item.id,
    name: item.name,
    stockCount: item.stockCount,
    sku: item.sku
  }))

  // 5. Fetch best selling products (using OrderItems aggregation)
  const orderItems = await db.orderItem.findMany({
    where: { order: { storeId } },
    include: { variant: { include: { product: true } } }
  })

  const counts: Record<string, { id: string; name: string; image: string | null; unitsSold: number; revenue: number }> = {}
  for (const item of orderItems) {
    const prod = item.variant.product
    if (!counts[prod.id]) {
      counts[prod.id] = {
        id: prod.id,
        name: prod.name,
        image: prod.images[0] || null,
        unitsSold: 0,
        revenue: 0
      }
    }
    counts[prod.id].unitsSold += item.quantity
    counts[prod.id].revenue += item.price * item.quantity
  }

  const bestSellers = Object.values(counts)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)

  // 6. Generate sales chart data for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    return d
  }).reverse()

  const dailyOrders = await db.order.findMany({
    where: {
      storeId,
      createdAt: {
        gte: last7Days[0]
      }
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  })

  const chartData = last7Days.map(date => {
    const dayLabel = date.toLocaleDateString(undefined, { weekday: 'short' })
    const amount = dailyOrders
      .filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getFullYear() === date.getFullYear() &&
               orderDate.getMonth() === date.getMonth() &&
               orderDate.getDate() === date.getDate()
      })
      .reduce((sum, order) => sum + order.totalAmount, 0)
    return { label: dayLabel, amount }
  })

  return (
    <DashboardOverviewClient
      storeName={store.name}
      userName={session.user.name || session.user.email?.split("@")[0] || "Merchant"}
      currency={store.currency}
      stats={{
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount,
        siteViews
      }}
      orderSummary={orderSummary}
      recentOrders={recentOrders}
      lowStockItems={lowStockItems}
      bestSellers={bestSellers}
      chartData={chartData}
    />
  )
}
