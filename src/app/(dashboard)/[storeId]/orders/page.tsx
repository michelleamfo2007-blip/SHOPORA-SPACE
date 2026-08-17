import { db } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function OrdersPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({
    where: { id: storeId },
    include: {
      orders: {
        include: {
          customer: true,
          orderItems: true
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
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Fulfillment Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
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
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-blue-600">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.customer.name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 ring-1 ring-inset ring-slate-500/20">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {store.currency} {order.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
