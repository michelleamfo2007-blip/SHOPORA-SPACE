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
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-slate-500">Manage and fulfill your store's orders.</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {ORDER_STATUSES.map((s) => {
            const isActive = (s === "ALL" && !validStatus) || s === validStatus
            return (
              <Link key={s} href={`/${storeId}/orders${s === "ALL" ? "" : `?status=${s}`}`}>
                <Button variant={isActive ? "default" : "outline"} size="sm" className="whitespace-nowrap">
                  {s.replace("_", " ")}
                </Button>
              </Link>
            )
          })}
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
                  No orders found.
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
