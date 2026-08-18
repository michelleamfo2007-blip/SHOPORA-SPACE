"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateStoreBrandingAction } from "@/server/actions/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsForm({ store }: { store: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      const result = await updateStoreBrandingAction(store.id, formData)
      if (result.success) {
        toast.success("Store settings updated successfully!")
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="name">Store Name (Read-Only)</Label>
        <Input id="name" defaultValue={store.name} disabled className="bg-slate-50" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Store URL (Read-Only)</Label>
        <div className="flex items-center space-x-2">
          <Input id="slug" defaultValue={store.slug} disabled className="flex-1 bg-slate-50" />
          <span className="text-sm text-slate-500 font-medium">.shopora.space</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Store Description / Tagline</Label>
        <Textarea 
          id="description" 
          name="description" 
          defaultValue={store.description || ""} 
          placeholder="e.g. Premium wigs for every occasion"
          className="resize-none"
        />
        <p className="text-xs text-slate-500">This appears on your storefront homepage.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo Image URL</Label>
          <Input 
            id="logoUrl" 
            name="logoUrl" 
            defaultValue={store.logoUrl || ""} 
            placeholder="https://example.com/logo.png" 
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="primaryColor">Primary Brand Color</Label>
          <div className="flex gap-2">
            <Input 
              type="color"
              id="primaryColor" 
              name="primaryColor" 
              defaultValue={store.primaryColor || "#2563eb"} 
              className="w-16 h-10 p-1"
            />
            <Input 
              defaultValue={store.primaryColor || "#2563eb"} 
              disabled 
              className="flex-1 bg-slate-50"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-fit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
