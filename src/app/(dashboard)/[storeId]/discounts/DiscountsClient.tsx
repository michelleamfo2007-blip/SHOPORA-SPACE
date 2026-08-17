"use client"

import { useState } from "react"
import { toggleDiscountAction, deleteDiscountAction } from "@/server/actions/discount"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DiscountToggle({ storeId, discountId, initialIsActive }: { storeId: string, discountId: string, initialIsActive: boolean }) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    try {
      setLoading(true)
      await toggleDiscountAction(storeId, discountId, checked)
      setIsActive(checked)
    } catch (err) {
      console.error(err)
      alert("Failed to update discount status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Switch 
      checked={isActive}
      onCheckedChange={handleToggle}
      disabled={loading}
    />
  )
}

export function DeleteDiscountButton({ storeId, discountId }: { storeId: string, discountId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this discount?")) return

    try {
      setLoading(true)
      await deleteDiscountAction(storeId, discountId)
    } catch (err) {
      console.error(err)
      alert("Failed to delete discount")
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
