"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateStoreBrandingAction } from "@/server/actions/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DeliveryPolicyForm({ storeId, initialPolicy }: { storeId: string, initialPolicy: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      const result = await updateStoreBrandingAction(storeId, formData)
      if (result.success) {
        toast.success("Delivery policy updated successfully!")
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update delivery policy")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
      <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
        <CardTitle className="text-lg font-bold text-slate-900">Delivery Instructions</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Since your delivery is handled manually, write the instructions you want your customers to see at checkout (e.g. "We will contact you to arrange delivery and confirm the fee based on your exact location").
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Textarea 
            name="deliveryPolicy"
            defaultValue={initialPolicy}
            placeholder="Delivery is handled manually. We will call you to confirm your location and negotiate the rider fee."
            className="min-h-[120px] rounded-lg border-slate-200"
            required
          />
          <Button type="submit" disabled={loading} className="w-fit bg-slate-900 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-slate-800 transition-colors shadow-sm">
            {loading ? "Saving..." : "Save Delivery Instructions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
