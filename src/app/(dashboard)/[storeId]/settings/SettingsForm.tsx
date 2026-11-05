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
import { BRAND_COLORS, getStoreAccent } from "@/lib/store-brand"

export function SettingsForm({ store }: { store: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState(store.name || "")
  const [description, setDescription] = useState(store.description || "")
  const [currency, setCurrency] = useState(store.currency || "GHS")
  
  const [logoUrl, setLogoUrl] = useState(store.logoUrl || "")
  const [heroImageUrl, setHeroImageUrl] = useState(store.heroImage || "")
  const savedColor = getStoreAccent(store.primaryColor)
  const [primaryColor, setPrimaryColor] = useState(savedColor)
  const colorChoices: readonly { name: string; hex: string }[] = BRAND_COLORS.some((c) => c.hex.toLowerCase() === savedColor.toLowerCase())
    ? BRAND_COLORS
    : [...BRAND_COLORS, { name: "Current", hex: savedColor }]
  
  const [instagramHandle, setInstagramHandle] = useState(store.instagramHandle || "")
  const [whatsappNumber, setWhatsappNumber] = useState(store.whatsappNumber || "")
  const [tiktokHandle, setTiktokHandle] = useState(store.tiktokHandle || "")
  const [snapchatHandle, setSnapchatHandle] = useState(store.snapchatHandle || "")
  const [contactEmail, setContactEmail] = useState(store.contactEmail || "")

  const [announcementText, setAnnouncementText] = useState(store.announcementText || "")
  const [heroHeadline, setHeroHeadline] = useState(store.heroHeadline || "")
  const [heroSubtext, setHeroSubtext] = useState(store.heroSubtext || "")
  const [aboutText, setAboutText] = useState(store.aboutText || "")

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
      formData.append("announcementText", announcementText)
      formData.append("heroHeadline", heroHeadline)
      formData.append("heroSubtext", heroSubtext)
      formData.append("aboutText", aboutText)
      
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
          <Label>Brand colour</Label>
          <div className="flex flex-wrap gap-3">
            {colorChoices.map((c) => {
              const selected = c.hex.toLowerCase() === primaryColor.toLowerCase()
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setPrimaryColor(c.hex)}
                  aria-pressed={selected}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`h-10 w-10 rounded-full ring-offset-2 transition ${selected ? "ring-2 ring-stone-900" : "ring-1 ring-stone-200 hover:ring-stone-400"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className={`text-[11px] ${selected ? "text-stone-900" : "text-stone-500"}`}>{c.name}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-stone-500">Used for buttons, the announcement bar and stars on your store.</p>
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
        <h3 className="text-lg font-medium border-b pb-2">Storefront Text</h3>

        <div className="grid gap-2">
          <Label>Announcement bar</Label>
          <Input
            value={announcementText}
            onChange={e => setAnnouncementText(e.target.value)}
            maxLength={80}
            placeholder="e.g. Free delivery in Accra this weekend"
          />
          <p className="text-xs text-stone-500">A thin bar at the very top of your store. Leave empty to hide it.</p>
        </div>

        <div className="grid gap-2">
          <Label>Homepage headline</Label>
          <Input
            value={heroHeadline}
            onChange={e => setHeroHeadline(e.target.value)}
            maxLength={60}
            placeholder={name || "Your store name"}
          />
        </div>

        <div className="grid gap-2">
          <Label>Homepage subtext</Label>
          <Textarea
            value={heroSubtext}
            onChange={e => setHeroSubtext(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="One or two lines under the headline."
          />
        </div>

        <div className="grid gap-2">
          <Label>Our story</Label>
          <Textarea
            value={aboutText}
            onChange={e => setAboutText(e.target.value)}
            rows={4}
            placeholder="Who you are and why customers love your products. Shown on your homepage."
          />
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
            <Label>Instagram Link</Label>
            <Input 
              value={instagramHandle} 
              onChange={e => setInstagramHandle(e.target.value)} 
              placeholder="e.g. https://instagram.com/mystore"
            />
          </div>
          <div className="grid gap-2">
            <Label>TikTok Link</Label>
            <Input 
              value={tiktokHandle} 
              onChange={e => setTiktokHandle(e.target.value)} 
              placeholder="e.g. https://tiktok.com/@mystore"
            />
          </div>
          <div className="grid gap-2">
            <Label>Snapchat Link</Label>
            <Input 
              value={snapchatHandle} 
              onChange={e => setSnapchatHandle(e.target.value)} 
              placeholder="e.g. https://snapchat.com/add/mystore"
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
