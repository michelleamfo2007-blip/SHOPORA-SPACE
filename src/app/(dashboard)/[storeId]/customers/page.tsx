import { db } from "@/lib/db"
import { Users } from "lucide-react"
import { SUGGESTED_CUSTOMER_TAGS } from "@/lib/customer-notes"
import { PAID_ORDER_STATUSES } from "@/lib/store-roles"
import { CustomerList } from "./CustomerList"
import { storeHasFeature } from "@/lib/store-plan"
import { UpgradeCard } from "@/components/dashboard/UpgradeCard"

export default async function CustomersPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const [notesEnabled, store, customers] = await Promise.all([
    storeHasFeature(storeId, "customerNotes"),
    db.store.findUnique({ where: { id: storeId }, select: { currency: true } }),
    db.customer.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        tags: true,
        orders: { where: { status: { in: [...PAID_ORDER_STATUSES] } }, select: { totalAmount: true } },
        _count: { select: { orders: true } },
      },
    }),
  ])

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900">
          <Users className="h-8 w-8 text-blue-500" />
          Customers
        </h2>
        <p className="mt-1 text-slate-500">The people who buy from you. Add private notes and tags like VIP or Wholesale.</p>
      </div>
      {!notesEnabled && <UpgradeCard storeId={storeId} feature="customerNotes" compact />}
      <CustomerList
        storeId={storeId}
        notesEnabled={notesEnabled}
        currency={store?.currency ?? "GHS"}
        suggestedTags={SUGGESTED_CUSTOMER_TAGS}
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          notes: c.notes,
          tags: c.tags,
          orderCount: c._count.orders,
          spent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0),
        }))}
      />
    </div>
  )
}
