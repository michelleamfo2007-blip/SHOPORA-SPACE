import { db } from "@/lib/db"
import { requireMobileStoreManager } from "@/lib/mobile-auth"
import { getStoreSetup } from "@/lib/store-setup"
import { getMonthlyGoal } from "@/lib/sales-goal"
import { storeHasFeature } from "@/lib/store-plan"

/** Same numbers as the web dashboard Overview page. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const last7Days = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      return d
    })
    .reverse()

  const [revenue, totalOrders, totalProducts, lowStockCount, analytics, statuses, recent, lowStock, orderItems, dailyOrders, setup, goal] =
    await Promise.all([
      db.order.aggregate({ where: { storeId }, _sum: { totalAmount: true } }),
      db.order.count({ where: { storeId } }),
      db.product.count({ where: { storeId } }),
      db.product.count({ where: { storeId, stockCount: { lte: 10 } } }),
      db.storeAnalytics.aggregate({ where: { storeId }, _sum: { pageViews: true } }),
      db.order.groupBy({ by: ["status"], where: { storeId }, _count: { _all: true } }),
      db.order.findMany({
        where: { storeId },
        select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true, customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.product.findMany({
        where: { storeId, stockCount: { lte: 10 } },
        select: { id: true, name: true, stockCount: true, sku: true },
        take: 5,
      }),
      db.orderItem.findMany({
        where: { order: { storeId } },
        select: {
          quantity: true,
          price: true,
          variant: { select: { product: { select: { id: true, name: true, images: true } } } },
        },
      }),
      db.order.findMany({
        where: { storeId, createdAt: { gte: last7Days[0] } },
        select: { totalAmount: true, createdAt: true },
      }),
      getStoreSetup(storeId),
      storeHasFeature(storeId, "monthlyGoal").then((ok) => (ok ? getMonthlyGoal(storeId) : null)),
    ])

  const count = (...s: string[]) => statuses.filter((g) => s.includes(g.status)).reduce((n, g) => n + g._count._all, 0)

  const sellers: Record<string, { id: string; name: string; imageUrl: string | null; unitsSold: number; revenue: number }> = {}
  for (const item of orderItems) {
    const p = item.variant.product
    sellers[p.id] ??= { id: p.id, name: p.name, imageUrl: p.images[0] ?? null, unitsSold: 0, revenue: 0 }
    sellers[p.id].unitsSold += item.quantity
    sellers[p.id].revenue += item.price * item.quantity
  }

  const chart = last7Days.map((date) => ({
    label: date.toLocaleDateString("en-GB", { weekday: "short" }),
    amount: dailyOrders
      .filter((o) => o.createdAt.toDateString() === date.toDateString())
      .reduce((sum, o) => sum + o.totalAmount, 0),
  }))

  return Response.json({
    currency: access.store.currency,
    stats: {
      totalRevenue: revenue._sum.totalAmount || 0,
      totalOrders,
      totalProducts,
      lowStockCount,
      siteViews: analytics._sum.pageViews || 0,
    },
    orderSummary: {
      pending: count("PENDING", "PENDING_VERIFICATION"),
      processing: count("PROCESSING"),
      shipped: count("SHIPPED"),
      delivered: count("DELIVERED"),
      refunded: count("REFUNDED"),
    },
    recentOrders: recent.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer.name || "Customer",
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
    })),
    lowStockItems: lowStock,
    bestSellers: Object.values(sellers)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5),
    chart,
    setup,
    goal,
  })
}
