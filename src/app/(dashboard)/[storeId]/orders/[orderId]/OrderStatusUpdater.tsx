"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateOrderStatusAction } from "@/server/actions/order"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const ORDER_STATUSES = [
  "PENDING",
  "PENDING_VERIFICATION",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED"
]

export function OrderStatusUpdater({ storeId, orderId, initialStatus }: { storeId: string, orderId: string, initialStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus || newStatus === initialStatus) return
    
    setLoading(true)
    const result = await updateOrderStatusAction(storeId, orderId, newStatus)
    setLoading(false)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Order status updated successfully")
      router.refresh()
    }
  }

  return (
    <Select disabled={loading} defaultValue={initialStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map(status => (
          <SelectItem key={status} value={status}>
            {status.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
