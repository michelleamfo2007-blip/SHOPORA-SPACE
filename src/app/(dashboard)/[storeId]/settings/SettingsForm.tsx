"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateStoreBrandingAction } from "@/server/actions/store"
import { MediaUploader } from "@/components/dashboard/MediaUploader"

export function SettingsForm({ store }: { store: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState(store.name || "")
  const [description, setDescription] = useState(store.description || "")
  const [currency, setCurrency] = useState(store.currency || "GHS")
  
  const [logoUrl, setLogoUrl] = useState(store.logoUrl || "")
  const [heroImageUrl, setHeroImageUrl] = useState(store.heroImage || "")
  const [primaryColor, setPrimaryColor] = useState(store.primaryColor || "#000000")
  
  const [instagramHandle, setInstagramHandle] = useState(store.instagramHandle || "")
  const [whatsappNumber, setWhatsappNumber] = useState(store.whatsappNumber || "")
  const [tiktokHandle, setTiktokHandle] = useState(store.tiktokHandle || "")
  const [snapchatHandle, setSnapchatHandle] = useState(store.snapchatHandle || "")
  const [contactEmail, setContactEmail] = useState(store.contactEmail || "")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("storeId", store.id)
      formData.append("name", name)
      formData.append("description", description)
      formData.append("currency", currency)
      formData.append("logoUrl", logoUrl)
      formData.append("heroImage", heroImageUrl)
      formData.append("primaryColor", primaryColor)
      formData.append("instagramHandle", instagramHandle)
      formData.append("whatsappNumber", whatsappNumber)
      formData.append("tiktokHandle", tiktokHandle)
      formData.append("snapchatHandle", snapchatHandle)
      formData.append("contactEmail", contactEmail)
      
      await updateStoreBrandingAction(store.id, formData)
      
      toast.success("Settings updated successfully")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 max-w-2xl">
      <div className="grid gap-6">
        <h3 className="text-lg font-medium border-b pb-2">General Details</h3>
        
        <div className="grid gap-2">
          <Label>Store Name</Label>
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. My Awesome Store"
            required 
          />
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="What is your store about?"
            rows={3} 
          />
        </div>

        <div className="grid gap-2">
          <Label>Store Currency</Label>
          <select 
            value={currency} 
            onChange={e => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="GHS">Ghanaian Cedi (GHS)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        <h3 className="text-lg font-medium border-b pb-2">Branding</h3>
        
        <div className="grid gap-2">
          <Label>Brand Color</Label>
          <div className="flex gap-4 items-center">
            <Input 
              type="color" 
              value={primaryColor} 
              onChange={e => setPrimaryColor(e.target.value)} 
              className="w-16 h-10 p-1 cursor-pointer" 
            />
            <Input 
              value={primaryColor} 
              onChange={e => setPrimaryColor(e.target.value)} 
              placeholder="#000000"
              className="w-32" 
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Logo</Label>
            <MediaUploader 
              storeId={store.id} 
              currentMedia={logoUrl} 
              onUploaded={setLogoUrl} 
              label="Upload Logo"
            />
          </div>
          <div className="grid gap-2">
            <Label>Hero Background Image</Label>
            <MediaUploader 
              storeId={store.id} 
              currentMedia={heroImageUrl} 
              onUploaded={setHeroImageUrl} 
              label="Upload Hero Image"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <h3 className="text-lg font-medium border-b pb-2">Social Media & Contact</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Contact Email</Label>
            <Input 
              type="email"
              value={contactEmail} 
              onChange={e => setContactEmail(e.target.value)} 
              placeholder="hello@mystore.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>WhatsApp Number</Label>
            <Input 
              value={whatsappNumber} 
              onChange={e => setWhatsappNumber(e.target.value)} 
              placeholder="e.g. +233 24 123 4567"
            />
          </div>
          <div className="grid gap-2">
            <Label>Instagram Handle</Label>
            <Input 
              value={instagramHandle} 
              onChange={e => setInstagramHandle(e.target.value)} 
              placeholder="e.g. @mystore"
            />
          </div>
          <div className="grid gap-2">
            <Label>TikTok Handle</Label>
            <Input 
              value={tiktokHandle} 
              onChange={e => setTiktokHandle(e.target.value)} 
              placeholder="e.g. @mystore"
            />
          </div>
          <div className="grid gap-2">
            <Label>Snapchat Handle</Label>
            <Input 
              value={snapchatHandle} 
              onChange={e => setSnapchatHandle(e.target.value)} 
              placeholder="e.g. @mystore"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
