"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, RefreshCw, Globe, Lock, ImageIcon } from "lucide-react"
import { MediaUploader } from "@/components/dashboard/MediaUploader"
import { MultiImageUploader } from "@/components/dashboard/MultiImageUploader"

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
    newOpts[index].values = valStr.split(/[,;]/).map(v => v.trim()).filter(Boolean)
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
        ? `/api/stores/${storeId}/products/${initialData.id}` 
        : `/api/stores/${storeId}/products`
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
      router.push(`/${storeId}/products`)
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
              <CardTitle>Product Images *</CardTitle>
              <CardDescription>Upload images for your product.</CardDescription>
            </CardHeader>
            <CardContent>
              <MultiImageUploader 
                storeId={storeId} 
                images={images} 
                onImagesChange={setImages} 
              />
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
                <div key={index} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg bg-slate-50/50 relative">
                  <div className="grid gap-2 w-full md:flex-1 pr-8 md:pr-0">
                    <Label>Option Name (e.g. Size)</Label>
                    <Input value={option.name} onChange={e => updateOptionName(index, e.target.value)} />
                  </div>
                  <div className="grid gap-2 w-full md:flex-[2]">
                    <Label>Values (comma separated)</Label>
                    <Input value={option.values.join(", ")} placeholder="Small, Medium, Large" onChange={e => updateOptionValues(index, e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" className="absolute top-2 right-2 md:static md:mt-7 text-red-500 hover:text-red-700 hover:bg-red-50 p-2" onClick={() => removeOption(index)}>
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
                      <div key={index} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white hover:bg-slate-50 transition-colors">
                        <div className="md:col-span-3 font-medium text-sm text-slate-800 break-words mb-2 md:mb-0">{variant.name}</div>
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-xs text-slate-500 md:hidden w-12 font-medium">Price</span>
                          <Input type="number" size={1} className="h-8 text-sm flex-1" placeholder="Price" value={variant.price} onChange={e => updateVariant(index, "price", e.target.value)} />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                          <span className="text-xs text-slate-500 md:hidden w-12 font-medium">Stock</span>
                          <Input type="number" className="h-8 text-sm flex-1" placeholder="Stock" value={variant.stockCount} onChange={e => updateVariant(index, "stockCount", e.target.value)} />
                        </div>
                        <div className="md:col-span-4 flex items-center gap-2">
                          <span className="text-xs text-slate-500 md:hidden w-12 font-medium">SKU</span>
                          <Input className="h-8 text-sm flex-1" placeholder="SKU" value={variant.sku} onChange={e => updateVariant(index, "sku", e.target.value)} />
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
              
              {/* Live Preview Card */}
              <div className="mt-4 p-6 bg-[#faf9f8] border rounded-lg flex justify-center">
                <div className="w-64 bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-square bg-[#e2e4e9] relative flex flex-col items-center justify-center">
                    {images[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={images[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                        <span className="text-xs text-slate-400 font-medium">No image uploaded</span>
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-medium text-slate-500 tracking-wider mb-1">NEW IN</div>
                    <div className="font-serif text-[15px] font-semibold leading-snug line-clamp-2 mb-2 text-slate-900">
                      {seoTitle || name || "Premium Product Name Example"}
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      GHS {price || "0.00"}
                    </div>
                  </div>
                </div>
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
                <Label>Size Guide Image</Label>
                <MediaUploader 
                  storeId={storeId} 
                  currentMedia={sizeGuideUrl} 
                  onUploaded={setSizeGuideUrl} 
                  label="Upload Size Guide"
                />
              </div>
              <div className="grid gap-2">
                <Label>Product Video</Label>
                <MediaUploader 
                  storeId={storeId} 
                  currentMedia={videoUrl} 
                  onUploaded={setVideoUrl} 
                  type="video"
                  accept="video/*"
                  label="Upload Video"
                />
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
