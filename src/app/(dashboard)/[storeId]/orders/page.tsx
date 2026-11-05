import { db } from "@/lib/db"
import { OrderRow } from "./OrderRow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, ShoppingBag } from "lucide-react"
import { OrderStatus } from "@prisma/client"
import { ORDER_SOURCE_LABELS } from "@/lib/manual-order"
import { orderPaymentReminder } from "@/lib/payment-reminder"

export default async function OrdersPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ storeId: string }>,
  searchParams: Promise<{ status?: string }>
}) {
  const { storeId } = await params;
  const { status } = await searchParams;

  const validStatus = status && Object.keys(OrderStatus).includes(status) ? (status as OrderStatus) : undefined

  const store = await db.store.findUnique({
    where: { id: storeId },
    include: {
      orders: {
        where: validStatus ? { status: validStatus } : undefined,
        include: {
          customer: true,
          orderItems: true,
          payments: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!store) return null

  const paymentSetting = await db.storePaymentSetting.findUnique({
    where: { storeId },
    select: { mobileMoneyNumber: true, accountName: true, bankName: true, accountNumber: true },
  })
  const orders = store.orders.map((order) => ({
    ...order,
    sourceLabel: order.source === "WEBSITE" ? null : ORDER_SOURCE_LABELS[order.source],
    reminderUrl: orderPaymentReminder(order, store, paymentSetting)?.url ?? null,
  }))

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-emerald-500" />
            Orders
          </h2>
          <p className="text-slate-500 mt-1">Manage and fulfill your store's orders.</p>
        </div>
        
        <Link
          href={`/${storeId}/orders/new`}
          className="inline-flex h-10 items-center gap-2 self-start rounded-full bg-stone-950 px-5 text-sm font-medium text-white hover:bg-stone-800 sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Record an order
        </Link>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">All Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment Ref</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <OrderRow key={order.id} order={order} store={store} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
