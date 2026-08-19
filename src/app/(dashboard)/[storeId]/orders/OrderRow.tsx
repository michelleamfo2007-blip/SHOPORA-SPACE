"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
    <tr 
      className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
      onClick={() => router.push(`/${store.id}/orders/${order.id}`)}
    >
      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        #{order.orderNumber}
        <div className="text-xs text-slate-500 font-medium mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
      </td>
      <td className="px-6 py-4 font-semibold text-slate-700">
        {order.customer.name}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
          order.status === "PENDING" || order.status === "PENDING_VERIFICATION" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
          order.status === "PROCESSING" ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
          order.status === "SHIPPED" ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20" :
          order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" :
          "bg-red-50 text-red-700 ring-red-600/20"
        }`}>
          {order.status.replace("_", " ")}
        </span>
      </td>
      <td className="px-6 py-4">
        {payment?.reference ? (
          <span className="font-mono text-xs bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md">{payment.reference}</span>
        ) : (
          <span className="text-slate-400 font-semibold">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right font-extrabold text-slate-900">
        {store.currency} {order.totalAmount.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        {order.status === "PENDING_VERIFICATION" ? (
          <Button size="sm" onClick={onVerify} disabled={loading} className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold border-0">
            {loading ? "Verifying..." : "Verify Payment"}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors" disabled={loading}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-medium rounded-xl">
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "PROCESSING")} className="cursor-pointer">
                Mark as Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "SHIPPED")} className="cursor-pointer">
                Mark as Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "DELIVERED")} className="cursor-pointer">
                Mark as Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onUpdateStatus(e, "CANCELLED")} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  )
}
