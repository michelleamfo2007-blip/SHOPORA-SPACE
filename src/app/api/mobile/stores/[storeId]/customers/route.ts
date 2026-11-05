import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { SUGGESTED_CUSTOMER_TAGS } from "@/lib/customer-notes"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const customers = await db.customer.findMany({
    where: { storeId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      totalSpent: true,
      notes: true,
      tags: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  return Response.json({
    currency: access.store.currency,
    customers: customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalSpent: c.totalSpent,
      orderCount: c._count.orders,
      notes: c.notes,
      tags: c.tags,
      createdAt: c.createdAt,
    })),
    suggestedTags: SUGGESTED_CUSTOMER_TAGS,
  })
}
