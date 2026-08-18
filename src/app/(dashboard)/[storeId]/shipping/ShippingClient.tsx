"use client"

import { useState } from "react"
import { deleteShippingZoneAction, deleteShippingRateAction, createShippingRateAction } from "@/server/actions/shipping"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

export function DeleteZoneButton({ storeId, zoneId }: { storeId: string, zoneId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shipping zone and all its rates?")) return
    try {
      setLoading(true)
      await deleteShippingZoneAction(storeId, zoneId)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}

export function DeleteRateButton({ storeId, rateId }: { storeId: string, rateId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shipping rate?")) return
    try {
      setLoading(true)
      await deleteShippingRateAction(storeId, rateId)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}

export function AddRateForm({ storeId, zoneId }: { storeId: string, zoneId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      setLoading(true)
      await createShippingRateAction(storeId, zoneId, formData)
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
      alert("Failed to add rate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4 items-end bg-slate-50 p-4 rounded-lg border">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Rate Name</Label>
        <Input name="name" placeholder="e.g. Standard" required className="h-8" />
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Price ($)</Label>
        <Input name="price" type="number" min="0" step="0.01" placeholder="e.g. 5.00" required className="h-8" />
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Estimated Days</Label>
        <Input name="estimatedDays" placeholder="e.g. 3-5 days" className="h-8" />
      </div>
      <Button type="submit" size="sm" disabled={loading} className="h-8">
        <Plus className="w-4 h-4 mr-2" />
        Add Rate
      </Button>
    </form>
  )
}
