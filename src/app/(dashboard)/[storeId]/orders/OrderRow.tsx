"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { verifyOrderPaymentAction } from "@/server/actions/order"
import { useRouter } from "next/navigation"

export function OrderRow({ order, store }: { order: any, store: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const payment = order.payments?.[0]

  async function onVerify() {
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

  return (
    <TableRow>
      <TableCell className="font-medium text-blue-600">
        #{order.orderNumber}
        <div className="text-xs text-slate-400 font-normal mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
      </TableCell>
      <TableCell>
        {order.customer.name}
      </TableCell>
      <TableCell>
        <Badge variant={order.status === "PENDING_VERIFICATION" ? "secondary" : "default"}>
          {order.status.replace("_", " ")}
        </Badge>
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
      <TableCell className="text-right">
        {order.status === "PENDING_VERIFICATION" && (
          <Button size="sm" onClick={onVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify Payment"}
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
