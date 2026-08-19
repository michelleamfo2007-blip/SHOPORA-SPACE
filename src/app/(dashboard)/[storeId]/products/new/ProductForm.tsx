"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, RefreshCw, Globe, Lock } from "lucide-react"
import { HeroImageUploader } from "@/components/dashboard/HeroImageUploader"

interface ProductFormProps {
  storeId: string
  initialData?: any
}

export function ProductForm({ storeId, initialData }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Basic
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  
  // Publishing & Visibility
  const [status, setStatus] = useState(initialData?.status || "ACTIVE")
  const [visibility, setVisibility] = useState(initialData?.visibility || "VISIBLE")
  
  // Media
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [sizeGuideUrl, setSizeGuideUrl] = useState(initialData?.sizeGuideUrl || "")
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "")

  // Pricing
  const [price, setPrice] = useState(initialData?.price?.toString() || "")
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice?.toString() || "")
  
  // Inventory
  const [sku, setSku] = useState(initialData?.sku || "")
  const [stockCount, setStockCount] = useState(initialData?.stockCount?.toString() || "0")
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.lowStockThreshold?.toString() || "5")
  
  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "")
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "")

  // Options & Variants
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>(
    initialData?.options?.map((o: any) => ({
      name: o.name,
      values: o.values.map((v: any) => v.value)
    })) || []
  )
  const [variants, setVariants] = useState<{ id?: string; name: string; price: string; compareAtPrice: string; sku: string; stockCount: number; imageBase64: string }[]>(
    initialData?.variants?.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price?.toString() || "",
      compareAtPrice: v.compareAtPrice?.toString() || "",
      sku: v.sku || "",
      stockCount: v.stockCount || 0,
      imageBase64: v.imageUrl || ""
    })) || []
  )

  const generateSku = () => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : "PRD"
    const random = Math.floor(1000 + Math.random() * 9000)
    setSku(`${prefix}-${random}`)
  }

  const addOption = () => setOptions([...options, { name: "", values: [""] }])
  const removeOption = (index: number) => {
    const newOpts = options.filter((_, i) => i !== index)
    setOptions(newOpts)
    generateVariants(newOpts)
  }
  const updateOptionName = (index: number, n: string) => {
    const newOpts = [...options]
    newOpts[index].name = n
    setOptions(newOpts)
  }
  const updateOptionValues = (index: number, valStr: string) => {
    const newOpts = [...options]
    newOpts[index].values = valStr.split(",").map(v => v.trim()).filter(Boolean)
    setOptions(newOpts)
    generateVariants(newOpts)
  }

  const generateVariants = (currentOptions: { name: string; values: string[] }[]) => {
    if (currentOptions.length === 0 || currentOptions.every(o => o.values.length === 0)) {
      setVariants([])
      return
    }
    const combinations = currentOptions.reduce((a, b) => {
      if (b.values.length === 0) return a
      if (a.length === 0) return b.values.map(v => [v])
      return a.flatMap(d => b.values.map(v => [...d, v]))
    }, [] as string[][])

    // Try to preserve existing variant data if name matches
    const newVars = combinations.map(combo => {
      const vName = combo.join(" / ")
      const existing = variants.find(v => v.name === vName)
      if (existing) return existing

      return {
        name: vName,
        price: price,
        compareAtPrice: compareAtPrice,
        sku: `${sku ? sku + '-' : ''}${combo.map(c => c.substring(0,3).toUpperCase()).join('-')}`,
        stockCount: 0,
        imageBase64: ""
      }
    })
    setVariants(newVars)
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVars = [...variants]
    newVars[index] = { ...newVars[index], [field]: value }
    setVariants(newVars)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const url = initialData 
        ? /api/stores//products/ 
        : /api/stores//products
      const method = initialData ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, status, visibility,
          price: parseFloat(price) || 0,
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          sku, stockCount: parseInt(stockCount) || 0,
          lowStockThreshold: parseInt(lowStockThreshold) || 5,
          images, sizeGuideUrl, videoUrl,
          seoTitle, seoDescription,
          options,
          variants: variants.map(v => ({
            ...v,
            price: parseFloat(v.price) || 0,
            compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
            stockCount: parseInt(v.stockCount.toString()) || 0
          }))
        })
      })
      if (!response.ok) throw new Error("Failed to save product")
      router.push(//products)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="pb-24">
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Left Column */}
        <div className="md:col-span-2 grid gap-8">
          
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label>Product Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vintage Leather Jacket" required />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product..." rows={5} className="resize-none" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload the main image for your product.</CardDescription>
            </CardHeader>
            <CardContent>
              <HeroImageUploader 
                storeId={storeId} 
                currentImage={images[0] || ""} 
                onUploaded={(url) => setImages([url])} 
              />
              <div className="mt-4 grid gap-2">
                <Label className="text-xs text-slate-500">Image URL (Fallback)</Label>
                <Input value={images[0] || ""} onChange={e => setImages([e.target.value])} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label>Selling Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                    <Input type="number" step="0.01" className="pl-7" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Old Price (Compare-at)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                    <Input type="number" step="0.01" className="pl-7" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Inventory & Stock</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label>Stock Quantity *</Label>
                  <Input type="number" value={stockCount} onChange={e => setStockCount(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>Low Stock Threshold</Label>
                  <Input type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2 pt-2 border-t">
                <Label>SKU (Stock Keeping Unit)</Label>
                <div className="flex gap-2">
                  <Input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. VINT-LEATH-001" />
                  <Button type="button" variant="outline" onClick={generateSku}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Variants (Optional)</CardTitle>
                <CardDescription>Does this product come in different sizes or colors?</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2"/> Add Option
              </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              {options.map((option, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50/50">
                  <div className="grid gap-2 flex-1">
                    <Label>Option Name (e.g. Size)</Label>
                    <Input value={option.name} onChange={e => updateOptionName(index, e.target.value)} />
                  </div>
                  <div className="grid gap-2 flex-[2]">
                    <Label>Values (comma separated)</Label>
                    <Input value={option.values.join(", ")} placeholder="Small, Medium, Large" onChange={e => updateOptionValues(index, e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" className="mt-7 text-red-500" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {variants.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3 border-b font-medium text-sm flex justify-between items-center">
                    <span>Generated Variants ({variants.length})</span>
                  </div>
                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {variants.map((variant, index) => (
                      <div key={index} className="p-4 grid grid-cols-12 gap-4 items-center bg-white hover:bg-slate-50 transition-colors">
                        <div className="col-span-3 font-medium text-sm">{variant.name}</div>
                        <div className="col-span-3">
                          <Input type="number" size={1} className="h-8 text-sm" placeholder="Price" value={variant.price} onChange={e => updateVariant(index, "price", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <Input type="number" className="h-8 text-sm" placeholder="Stock" value={variant.stockCount} onChange={e => updateVariant(index, "stockCount", e.target.value)} />
                        </div>
                        <div className="col-span-4">
                          <Input className="h-8 text-sm" placeholder="SKU" value={variant.sku} onChange={e => updateVariant(index, "sku", e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>Improve how your product looks on Google and social media.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label>SEO Title</Label>
                <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={name || "Product Title"} />
              </div>
              <div className="grid gap-2">
                <Label>SEO Description</Label>
                <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder={description?.substring(0, 160) || "Brief description for search engines..."} rows={3} />
              </div>
              
              {/* Live Preview */}
              <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Search Result Preview</span>
                <div className="text-[#1a0dab] text-xl cursor-pointer hover:underline truncate">{seoTitle || name || "Product Title"}</div>
                <div className="text-[#006621] text-sm truncate">shopora.space/products/this-product</div>
                <div className="text-[#545454] text-sm mt-1 line-clamp-2">{seoDescription || description || "No description provided."}</div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar */}
        <div className="grid gap-8 h-fit">
          
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Product Status</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">🟢 Active</option>
                  <option value="DRAFT">📝 Draft</option>
                  <option value="ARCHIVED">📦 Archived</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="visibility" value="VISIBLE" checked={visibility === "VISIBLE"} onChange={() => setVisibility("VISIBLE")} className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium flex items-center gap-2"><Globe className="w-4 h-4 text-slate-500"/> Visible in Store</div>
                    <div className="text-xs text-slate-500">Customers can find and buy this.</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="visibility" value="HIDDEN" checked={visibility === "HIDDEN"} onChange={() => setVisibility("HIDDEN")} className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium flex items-center gap-2"><Lock className="w-4 h-4 text-slate-500"/> Hidden from Store</div>
                    <div className="text-xs text-slate-500">Only accessible via direct link.</div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Additional Media</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Size Guide Image URL</Label>
                <Input value={sizeGuideUrl} onChange={e => setSizeGuideUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="grid gap-2">
                <Label>Product Video URL</Label>
                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="YouTube or MP4 link..." />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end gap-4 z-10 lg:pl-64">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  )
}
