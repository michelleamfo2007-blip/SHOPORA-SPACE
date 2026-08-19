"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateStoreBrandingAction } from "@/server/actions/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <Card>
      <CardHeader>
        <CardTitle>Delivery Instructions</CardTitle>
        <CardDescription>
          Since your delivery is handled manually, write the instructions you want your customers to see at checkout (e.g. "We will contact you to arrange delivery and confirm the fee based on your exact location").
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Textarea 
            name="deliveryPolicy"
            defaultValue={initialPolicy}
            placeholder="Delivery is handled manually. We will call you to confirm your location and negotiate the rider fee."
            className="min-h-[120px]"
            required
          />
          <Button type="submit" disabled={loading} className="w-fit">
            {loading ? "Saving..." : "Save Delivery Instructions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
