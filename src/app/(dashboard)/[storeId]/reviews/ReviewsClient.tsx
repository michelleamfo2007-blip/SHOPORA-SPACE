"use client"

import { useState } from "react"
import { toggleReviewStatusAction, deleteReviewAction } from "@/server/actions/reviews"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function ReviewVisibilityToggle({ storeId, reviewId, initialIsHidden }: { storeId: string, reviewId: string, initialIsHidden: boolean }) {
  const [isHidden, setIsHidden] = useState(initialIsHidden)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    try {
      setLoading(true)
      await toggleReviewStatusAction(storeId, reviewId, checked)
      setIsHidden(checked)
    } catch (err) {
      console.error(err)
      alert("Failed to update review status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        checked={isHidden}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <span className="text-sm text-muted-foreground">{isHidden ? "Hidden" : "Visible"}</span>
    </div>
  )
}

export function DeleteReviewButton({ storeId, reviewId }: { storeId: string, reviewId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return
    try {
      setLoading(true)
      await deleteReviewAction(storeId, reviewId)
    } catch (err) {
      console.error(err)
      alert("Failed to delete review")
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
