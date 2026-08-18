"use client"

import { useState } from "react"
import { toggleReviewStatusAction, deleteReviewAction } from "@/server/actions/reviews"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import { addManualReviewAction } from "@/server/actions/reviews"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

export function AddManualReviewModal({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await addManualReviewAction(storeId, { customerName: name, rating, comment })
      setOpen(false)
      setName("")
      setRating(5)
      setComment("")
    } catch (err) {
      console.error(err)
      alert("Failed to add review. Ensure you have at least one product created.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Add Review Manually
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
              <Input type="number" min={1} max={5} required value={rating} onChange={e => setRating(parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Comment</label>
              <Textarea required value={comment} onChange={e => setComment(e.target.value)} placeholder="Type the review here..." />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Review"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
