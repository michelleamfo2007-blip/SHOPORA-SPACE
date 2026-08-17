"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"

interface ProductFormProps {
  storeId: string
}

export function ProductForm({ storeId }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Basic Product State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [basePrice, setBasePrice] = useState("")
  
  // Options State (e.g. Size, Color)
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>([])
  
  // Derived Variants based on Options
  const [variants, setVariants] = useState<{ name: string; price: string; compareAtPrice: string; sku: string; stockCount: number; imageBase64: string }>([
    { name: "Default", price: "", compareAtPrice: "", sku: "", stockCount: 0, imageBase64: "" }
  ])

  const addOption = () => {
    setOptions([...options, { name: "", values: [""] }])
  }

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options]
    newOptions[index].name = name
    setOptions(newOptions)
  }

  const updateOptionValues = (index: number, valueString: string) => {
    const newOptions = [...options]
    newOptions[index].values = valueString.split(",").map(v => v.trim()).filter(v => v !== "")
    setOptions(newOptions)
    generateVariants(newOptions)
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    generateVariants(newOptions)
  }

  const generateVariants = (currentOptions: { name: string; values: string[] }[]) => {
    if (currentOptions.length === 0 || currentOptions.every(o => o.values.length === 0)) {
      setVariants([{ name: "Default", price: basePrice, compareAtPrice: "", sku: "", stockCount: 0, imageBase64: "" }])
      return
    }

    // Generate Cartesian Product of all option values
    const combinations = currentOptions.reduce((a, b) => {
      if (b.values.length === 0) return a
      if (a.length === 0) return b.values.map(v => [v])
      return a.flatMap(d => b.values.map(v => [...d, v]))
    }, [] as string[][])

    const newVariants = combinations.map(combo => ({
      name: combo.join(" / "),
      price: basePrice,
      compareAtPrice: "",
      sku: "",
      stockCount: 0,
      imageBase64: ""
    }))
    
    setVariants(newVariants)
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateVariant(index, "imageBase64", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/stores/${storeId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          isActive,
          options,
          variants: variants.map(v => ({
            ...v,
            price: parseFloat(v.price) || 0,
            compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
            stockCount: parseInt(v.stockCount.toString()) || 0
          }))
        })
      })

      if (!response.ok) throw new Error("Failed to create product")
      
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
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="E.g. Vintage Leather Jacket" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your product's features..."
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="basePrice">Base Price</Label>
            <Input 
              id="basePrice" 
              type="number" 
              step="0.01" 
              value={basePrice}
              onChange={e => {
                setBasePrice(e.target.value)
                if (variants.length === 1 && variants[0].name === "Default") {
                  updateVariant(0, "price", e.target.value)
                }
              }}
              placeholder="0.00" 
              required 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Options & Variations</CardTitle>
            <CardDescription>Does this product come in different sizes, colors, or flavors?</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={addOption}><Plus className="h-4 w-4 mr-2"/> Add Option</Button>
        </CardHeader>
        <CardContent className="grid gap-6">
          {options.map((option, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start border p-4 rounded-md bg-slate-50">
              <div className="col-span-4 grid gap-2">
                <Label>Option Name</Label>
                <Input placeholder="E.g. Size or Color" value={option.name} onChange={e => updateOptionName(index, e.target.value)} />
              </div>
              <div className="col-span-7 grid gap-2">
                <Label>Values (comma separated)</Label>
                <Input placeholder="E.g. Small, Medium, Large" onChange={e => updateOptionValues(index, e.target.value)} />
              </div>
              <div className="col-span-1 flex justify-end pt-8">
                <Button type="button" variant="ghost" className="text-red-600 p-2" onClick={() => removeOption(index)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}

          {variants.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <h3 className="font-semibold mb-4">Generated Variants ({variants.length})</h3>
              <div className="grid gap-4 min-w-[800px]">
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-6 gap-4 items-end border-b pb-4">
                    <div className="col-span-1">
                      <Label className="text-slate-500 text-xs">Variant</Label>
                      <div className="font-medium pt-2">{variant.name}</div>
                    </div>
                    <div>
                      <Label>Image</Label>
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e)} className="text-xs" />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input type="number" step="0.01" value={variant.price} onChange={e => updateVariant(index, "price", e.target.value)} required />
                    </div>
                    <div>
                      <Label>Compare At (Discount)</Label>
                      <Input type="number" step="0.01" value={variant.compareAtPrice} onChange={e => updateVariant(index, "compareAtPrice", e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <Label>Stock</Label>
                      <Input type="number" value={variant.stockCount} onChange={e => updateVariant(index, "stockCount", e.target.value)} required />
                    </div>
                    <div>
                      <Label>SKU (Auto-gen if empty)</Label>
                      <Input value={variant.sku} onChange={e => updateVariant(index, "sku", e.target.value)} placeholder="Leave blank to auto-generate" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Active (Visible on Storefront)</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  )
}
