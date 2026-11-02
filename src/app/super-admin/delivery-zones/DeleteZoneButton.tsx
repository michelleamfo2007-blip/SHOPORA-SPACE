"use client"

import { useRouter } from "next/navigation"
import { deleteDeliveryZoneAction } from "@/server/actions/delivery-zones"
import { toast } from "sonner"

export function DeleteZoneButton({ zoneId }: { zoneId: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      className="text-xs font-medium text-red-700 underline"
      onClick={async () => {
        if (!confirm("Delete this delivery zone?")) return
        const result = await deleteDeliveryZoneAction(zoneId)
        if (result.error) toast.error(result.error)
        else {
          toast.success("Zone deleted")
          router.refresh()
        }
      }}
    >
      Delete
    </button>
  )
}
