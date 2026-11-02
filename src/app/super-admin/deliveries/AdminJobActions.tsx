"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cancelDeliveryJobAction, reopenDeliveryJobAction } from "@/server/actions/rider"
import { toast } from "sonner"

export function AdminJobActions({
  jobId,
  status,
}: {
  jobId: string
  status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function reopen() {
    setLoading(true)
    const result = await reopenDeliveryJobAction(jobId)
    setLoading(false)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Job reopened for riders")
      router.refresh()
    }
  }

  async function cancel() {
    if (!confirm("Cancel this Shopora delivery job?")) return
    setLoading(true)
    const result = await cancelDeliveryJobAction(jobId)
    setLoading(false)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Job cancelled")
      router.refresh()
    }
  }

  const canReopen = status === "FAILED" || status === "ASSIGNED" || status === "PICKED_UP"
  const canCancel = status !== "DELIVERED" && status !== "CANCELLED"

  if (!canReopen && !canCancel) return null

  return (
    <div className="flex flex-wrap gap-2">
      {canReopen && (
        <button
          type="button"
          disabled={loading}
          onClick={reopen}
          className="text-xs font-medium text-slate-700 underline disabled:opacity-50"
        >
          Reopen
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          disabled={loading}
          onClick={cancel}
          className="text-xs font-medium text-red-700 underline disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
