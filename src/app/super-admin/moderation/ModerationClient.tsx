"use client"

import { useState } from "react"
import { toggleStoreStatusAction } from "@/server/actions/super-admin"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StoreStatus } from "@prisma/client"
import { ShieldAlert, ShieldCheck } from "lucide-react"

interface StoreProps {
  storeId: string;
  status: StoreStatus;
}

export function ModerationStatusToggle({ storeId, status: initialStatus }: StoreProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StoreStatus>(initialStatus)

  const handleToggle = async () => {
    try {
      setLoading(true)
      const res = await toggleStoreStatusAction(storeId, status)
      if (res.success) {
        setStatus(res.newStatus as StoreStatus)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update store status")
    } finally {
      setLoading(false)
    }
  }

  const isActive = status === "ACTIVE"

  return (
    <div className="flex items-center gap-4">
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? "ACTIVE" : "SUSPENDED"}
      </Badge>
      <Button 
        variant={isActive ? "destructive" : "default"} 
        size="sm" 
        onClick={handleToggle} 
        disabled={loading}
      >
        {isActive ? (
          <>
            <ShieldAlert className="w-4 h-4 mr-2" />
            Suspend
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Activate
          </>
        )}
      </Button>
    </div>
  )
}
