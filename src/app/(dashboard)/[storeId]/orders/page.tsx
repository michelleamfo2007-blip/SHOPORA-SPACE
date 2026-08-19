import { db } from "@/lib/db"
import { OrderRow } from "./OrderRow"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"
import { OrderStatus } from "@prisma/client"

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

  const ORDER_STATUSES = [
    "ALL",
    "PENDING",
    "PENDING_VERIFICATION",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED"
  ]

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
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {/* Status filters removed by user request */}
        </div>
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
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {store.orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  store.orders.map((order) => (
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
