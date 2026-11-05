"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { verifyOrderPaymentAction, updateOrderStatusAction } from "@/server/actions/order"
import { useRouter } from "next/navigation"

const STATUS_OPTIONS = [
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

export function OrderRow({ order, store }: { order: any; store: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const storeId = store?.id as string
  const payment = order.payments?.[0]
  const isShopora = order.deliveryMethod === "SHOPORA"
  const statusOptions = STATUS_OPTIONS

  async function onVerify(e: React.MouseEvent) {
    e.stopPropagation()
    if (!storeId) {
      alert("Missing store id — refresh the page and try again.")
      return
    }
    if (
      !confirm(
        "Are you sure you want to verify this payment? Ensure you have actually received the funds in your account."
      )
    ) {
      return
    }

    setLoading(true)
    const result = await verifyOrderPaymentAction(storeId, order.id)
    setLoading(false)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  async function onUpdateStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation()
    const newStatus = e.target.value
    if (!newStatus || newStatus === order.status) return
    if (!storeId) {
      alert("Missing store id — refresh the page and try again.")
      return
    }

    setLoading(true)
    const result = await updateOrderStatusAction(storeId, order.id, newStatus)
    setLoading(false)
    if (result.error) {
      alert(result.error)
      e.target.value = order.status
    } else {
      router.refresh()
    }
  }

  return (
    <tr
      className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
      onClick={() => router.push(`/${store.id}/orders/${order.id}`)}
    >
      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        #{order.orderNumber}
        <div className="mt-1 text-xs font-medium text-slate-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
        {isShopora && (
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Shopora Delivery
          </div>
        )}
        {order.sourceLabel && (
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
            {order.sourceLabel} order
          </div>
        )}
      </td>
      <td className="px-6 py-4 font-semibold text-slate-700">
        {order.customer.name}
        {order.reminderUrl && (
          <a
            href={order.reminderUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 flex w-fit items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Remind on WhatsApp
          </a>
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
            order.status === "PENDING" || order.status === "PENDING_VERIFICATION"
              ? "bg-amber-50 text-amber-700 ring-amber-600/20"
              : order.status === "PROCESSING"
                ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                : order.status === "SHIPPED"
                  ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                  : order.status === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                    : "bg-red-50 text-red-700 ring-red-600/20"
          }`}
        >
          {order.status.replace("_", " ")}
        </span>
      </td>
      <td className="px-6 py-4">
        {payment?.reference ? (
          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-600">
            {payment.reference}
          </span>
        ) : (
          <span className="font-semibold text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right font-extrabold text-slate-900">
        {store.currency} {order.totalAmount.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        {order.status === "PENDING_VERIFICATION" || order.status === "PENDING" ? (
          <Button
            size="sm"
            onClick={onVerify}
            disabled={loading}
            className="border-0 bg-amber-100 font-bold text-amber-700 hover:bg-amber-200"
          >
            {loading ? "Saving..." : order.status === "PENDING" ? "Mark as paid" : "Verify Payment"}
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Change status
            </label>
            <select
              value={
                statusOptions.some((o) => o.value === order.status)
                  ? order.status
                  : order.status === "PENDING"
                    ? "PROCESSING"
                    : order.status
              }
              disabled={loading || order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "REFUNDED"}
              onChange={onUpdateStatus}
              className="h-9 min-w-[150px] rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 focus:border-slate-400 focus:outline-none disabled:opacity-60"
            >
              {!statusOptions.some((o) => o.value === order.status) && (
                <option value={order.status}>{order.status.replace("_", " ")}</option>
              )}
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {isShopora && (
              <p className="max-w-[200px] text-right text-[10px] leading-snug text-slate-500">
                For Shopora Delivery, prefer leaving Shipped/Delivered to the rider (OTP). You can still change status if needed.
              </p>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}
