import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"

/** Same numbers as the web Analytics page. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const [totalOrders, totalProducts, totalCustomers, traffic, revenue, recent] = await Promise.all([
    db.order.count({ where: { storeId } }),
    db.product.count({ where: { storeId } }),
    db.customer.count({ where: { storeId } }),
    db.storeAnalytics.aggregate({ where: { storeId }, _sum: { pageViews: true, visitors: true } }),
    db.order.aggregate({
      where: { storeId, status: { notIn: ["CANCELLED", "REFUNDED", "PENDING"] } },
      _sum: { totalAmount: true },
    }),
    db.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, status: true, totalAmount: true, customer: { select: { name: true } } },
    }),
  ])

  return Response.json({
    currency: access.store.currency,
    pageViews: traffic._sum.pageViews || 0,
    visitors: traffic._sum.visitors || 0,
    revenue: revenue._sum.totalAmount || 0,
    totalOrders,
    totalCustomers,
    totalProducts,
    recentOrders: recent.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: o.totalAmount,
      customerName: o.customer.name,
    })),
  })
}
