"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateShoporaDeliverySettingsAction } from "@/server/actions/shopora-delivery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ShoporaDeliveryForm({
  storeId,
  enabled,
  pickupAddress,
  pickupCity,
}: {
  storeId: string
  enabled: boolean
  pickupAddress: string
  pickupCity: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOn, setIsOn] = useState(enabled)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("shoporaDeliveryEnabled", isOn ? "true" : "false")

    try {
      const result = await updateShoporaDeliverySettingsAction(storeId, formData)
      if (result && "error" in result) {
        toast.error(result.error)
        return
      }
      toast.success(isOn ? "Shopora Delivery is on for Accra" : "Shopora Delivery turned off")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Could not save Shopora Delivery settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl border-0 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-5">
        <CardTitle className="text-lg font-bold text-slate-900">Shopora Delivery (Accra)</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Let customers choose Shopora riders at checkout. Live rates are calculated from your pickup address to theirs.
          Customers pay you for the products, and pay the rider the delivery fee on arrival.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={isOn}
              onChange={(e) => setIsOn(e.target.checked)}
            />
            <span>
              <span className="block font-medium text-slate-900">Offer Shopora Delivery</span>
              <span className="mt-1 block text-sm text-slate-500">Accra only for now. You still confirm product payment as usual.</span>
            </span>
          </label>

          <div className="grid gap-2">
            <label htmlFor="pickupAddress" className="text-sm font-medium text-slate-700">Pickup address</label>
            <Input
              id="pickupAddress"
              name="pickupAddress"
              defaultValue={pickupAddress}
              placeholder="Street, landmark, Accra area"
              disabled={!isOn}
              required={isOn}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="pickupCity" className="text-sm font-medium text-slate-700">Pickup city / area</label>
            <Input
              id="pickupCity"
              name="pickupCity"
              defaultValue={pickupCity || "Accra"}
              placeholder="Accra"
              disabled={!isOn}
              required={isOn}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-fit rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-white hover:bg-slate-800"
          >
            {loading ? "Saving..." : "Save Shopora Delivery"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
