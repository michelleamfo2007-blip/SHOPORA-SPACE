import type { OrderStatus } from "@prisma/client"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { ORDER_SOURCE_LABELS } from "@/lib/manual-order"

const FILTERS: Record<string, OrderStatus[] | null> = {
  all: null,
  to_verify: ["PENDING_VERIFICATION", "PENDING"],
  active: ["PROCESSING", "SHIPPED"],
  done: ["DELIVERED", "CANCELLED", "REFUNDED"],
}

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const filterKey = new URL(req.url).searchParams.get("filter") || "all"
  const statuses = filterKey in FILTERS ? FILTERS[filterKey] : null

  const [orders, grouped] = await Promise.all([
    db.order.findMany({
      where: { storeId, ...(statuses ? { status: { in: statuses } } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        deliveryMethod: true,
        source: true,
        createdAt: true,
        customer: { select: { name: true } },
        payments: { select: { reference: true }, orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { orderItems: true } },
      },
    }),
    db.order.groupBy({ by: ["status"], where: { storeId }, _count: { _all: true } }),
  ])

  const countFor = (list: OrderStatus[] | null) =>
    grouped.filter((g) => !list || list.includes(g.status)).reduce((sum, g) => sum + g._count._all, 0)

  return Response.json({
    currency: access.store.currency,
    counts: {
      all: countFor(null),
      to_verify: countFor(FILTERS.to_verify),
      active: countFor(FILTERS.active),
      done: countFor(FILTERS.done),
    },
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: o.totalAmount,
      deliveryMethod: o.deliveryMethod,
      source: o.source,
      sourceLabel: ORDER_SOURCE_LABELS[o.source] ?? o.source,
      createdAt: o.createdAt,
      customerName: o.customer.name,
      paymentReference: o.payments[0]?.reference ?? null,
      itemCount: o._count.orderItems,
    })),
  })
}
