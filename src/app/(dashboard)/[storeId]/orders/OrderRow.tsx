"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { verifyOrderPaymentAction, updateOrderStatusAction } from "@/server/actions/order"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export function OrderRow({ order, store }: { order: any, store: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const payment = order.payments?.[0]

  async function onVerify(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("Are you sure you want to verify this payment? Ensure you have actually received the funds in your account.")) return
    
    setLoading(true)
    const result = await verifyOrderPaymentAction(store.id, order.id)
    setLoading(false)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  async function onUpdateStatus(e: React.MouseEvent, newStatus: string) {
    e.stopPropagation()
    setLoading(true)
    const result = await updateOrderStatusAction(store.id, order.id, newStatus)
    setLoading(false)
    if (result.error) alert(result.error)
    else router.refresh()
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING":
      case "PENDING_VERIFICATION": return "bg-yellow-100 text-yellow-800"
      case "PROCESSING": return "bg-blue-100 text-blue-800"
      case "SHIPPED": return "bg-indigo-100 text-indigo-800"
      case "DELIVERED": return "bg-green-100 text-green-800"
      case "CANCELLED":
      case "REFUNDED": return "bg-red-100 text-red-800"
      default: return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <TableRow 
      className="cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={() => router.push(`/${store.id}/orders/${order.id}`)}
    >
      <TableCell className="font-medium text-blue-600">
        #{order.orderNumber}
        <div className="text-xs text-slate-400 font-normal mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
      </TableCell>
      <TableCell>
        {order.customer.name}
      </TableCell>
      <TableCell>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
          {order.status.replace("_", " ")}
        </span>
      </TableCell>
      <TableCell>
        {payment?.reference ? (
          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{payment.reference}</span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {store.currency} {order.totalAmount.toFixed(2)}
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        {order.status === "PENDING_VERIFICATION" ? (
          <Button size="sm" onClick={onVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify Payment"}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "PROCESSING")}>
                Mark as Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "SHIPPED")}>
                Mark as Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "DELIVERED")}>
                Mark as Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "CANCELLED")} className="text-red-600">
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  )
}
