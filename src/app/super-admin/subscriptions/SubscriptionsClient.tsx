"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { approvePaymentAction, rejectPaymentAction } from "@/server/actions/super-admin-billing"

export function SubscriptionsClient({ payments }: { payments: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      await approvePaymentAction(id)
    } catch (e) {
      alert("Failed to approve")
    }
    setLoadingId(null)
  }

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this payment?")) return
    setLoadingId(id)
    try {
      await rejectPaymentAction(id)
    } catch (e) {
      alert("Failed to reject")
    }
    setLoadingId(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
          <tr>
            <th className="px-4 py-3">Store</th>
            <th className="px-4 py-3">Plan / Amount</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                {p.subscription.store.name}
              </td>
              <td className="px-4 py-3">
                {p.subscription.plan.name} <br />
                <span className="text-slate-500">{p.subscription.plan.currency} {p.amount}</span>
              </td>
              <td className="px-4 py-3">{p.paymentMethod}</td>
              <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Badge variant={p.status === "APPROVED" ? "default" : p.status === "REJECTED" ? "destructive" : "secondary"}>
                  {p.status}
                </Badge>
              </td>
              <td className="px-4 py-3 space-x-2">
                {p.status === "PENDING" && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      disabled={loadingId === p.id}
                      onClick={() => handleApprove(p.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={loadingId === p.id}
                      onClick={() => handleReject(p.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
