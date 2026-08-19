"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateStoreBrandingAction } from "@/server/actions/store"
import { HeroImageUploader } from "@/components/dashboard/HeroImageUploader"

export function SettingsForm({ store }: { store: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [heroImageUrl, setHeroImageUrl] = useState<string>(store.heroImage || "")

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

      <div className="grid gap-2 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Regional Settings</h3>
        <Label htmlFor="currency">Currency Symbol</Label>
        <Input 
          id="currency" 
          name="currency" 
          defaultValue={store.currency || "$"} 
          placeholder="e.g. GHS, GH₵, $, £" 
          className="w-full max-w-xs"
        />
        <p className="text-xs text-slate-500">This symbol will be displayed next to all prices on your storefront.</p>
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

      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold mb-4">Storefront Hero Section</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="heroHeadline">Hero Headline</Label>
            <Input 
              id="heroHeadline" 
              name="heroHeadline" 
              defaultValue={store.heroHeadline || ""} 
              placeholder="Your Hair. Your Confidence. Your Look." 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="heroSubtext">Hero Subtext</Label>
            <Input 
              id="heroSubtext" 
              name="heroSubtext" 
              defaultValue={store.heroSubtext || ""} 
              placeholder="Premium wigs made to elevate your everyday look." 
            />
          </div>
          <div className="grid gap-2">
            <Label>Hero Background Image</Label>
            <HeroImageUploader
              storeId={store.id}
              currentImage={heroImageUrl || store.heroImage}
              onUploaded={url => setHeroImageUrl(url)}
            />
            <div className="mt-2 text-sm text-slate-500">Or paste an image URL directly:</div>
            <Input 
              type="text" 
              name="heroImage" 
              value={heroImageUrl} 
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/hero.jpg"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold mb-4">About & Social</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="aboutText">About The Seller</Label>
            <Textarea 
              id="aboutText" 
              name="aboutText" 
              defaultValue={store.aboutText || ""} 
              placeholder="Meet Chelle Wigs. Quality hair. Beautiful looks. Confidence that lasts." 
              className="resize-none h-24"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="instagramHandle">Instagram Handle</Label>
              <Input 
                id="instagramHandle" 
                name="instagramHandle" 
                defaultValue={store.instagramHandle || ""} 
                placeholder="@chellewigs" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input 
                id="whatsappNumber" 
                name="whatsappNumber" 
                defaultValue={store.whatsappNumber || ""} 
                placeholder="+233..." 
              />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-fit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
