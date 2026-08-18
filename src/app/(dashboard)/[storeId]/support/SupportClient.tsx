"use client"

import { useState } from "react"
import { resolveSupportTicketAction, reopenSupportTicketAction, deleteSupportTicketAction } from "@/server/actions/support"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Trash2 } from "lucide-react"

export function ResolveTicketButton({ storeId, ticketId, isResolved }: { storeId: string, ticketId: string, isResolved: boolean }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    try {
      setLoading(true)
      if (isResolved) {
        await reopenSupportTicketAction(storeId, ticketId)
      } else {
        await resolveSupportTicketAction(storeId, ticketId)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update ticket status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant={isResolved ? "outline" : "default"} 
      size="sm" 
      onClick={handleToggle} 
      disabled={loading}
      className={isResolved ? "text-slate-500" : "bg-emerald-600 hover:bg-emerald-700"}
    >
      {isResolved ? (
        <>
          <Circle className="w-4 h-4 mr-2" />
          Reopen
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Resolve
        </>
      )}
    </Button>
  )
}

export function DeleteTicketButton({ storeId, ticketId }: { storeId: string, ticketId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this support ticket?")) return
    try {
      setLoading(true)
      await deleteSupportTicketAction(storeId, ticketId)
    } catch (err) {
      console.error(err)
      alert("Failed to delete ticket")
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
