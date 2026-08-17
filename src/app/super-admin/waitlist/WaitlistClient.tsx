"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { approveWaitlistAction } from "@/server/actions/super-admin"

export function ApproveButton({ entryId }: { entryId: string }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    try {
      setLoading(true)
      await approveWaitlistAction(entryId)
    } catch (err) {
      console.error(err)
      alert("Failed to approve")
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleApprove} disabled={loading}>
      {loading ? "Approving..." : "Approve & Invite"}
    </Button>
  )
}
