import { db } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderRow } from "./OrderRow"

export default async function OrdersPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({
    where: { id: storeId },
    include: {
      orders: {
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

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-slate-500">Manage and fulfill your store's orders.</p>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Ref</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {store.orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              store.orders.map((order) => (
                <OrderRow key={order.id} order={order} store={store} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
