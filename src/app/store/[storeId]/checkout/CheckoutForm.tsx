"use client"

import { useCart } from "@/lib/cart"
import { processCheckoutAction } from "@/server/actions/checkout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function CheckoutForm({ storeId, currency }: { storeId: string, currency: string }) {
  const { items, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push("/")}>Continue Shopping</Button>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      formData.append("storeId", storeId)
      formData.append("cartData", JSON.stringify(items))
      
      const { orderId, authorizationUrl } = await processCheckoutAction(formData)
      
      clearCart()
      
      if (authorizationUrl) {
        // Redirect to Paystack secure checkout
        window.location.href = authorizationUrl
      } else {
        alert("Order placed successfully! Order ID: " + orderId)
        router.push("/")
      }
    } catch (error) {
      console.error(error)
      alert("Checkout failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
        <form action={handleSubmit} className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mt-4 mb-2">Shipping Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" required />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Complete Order"}
          </Button>
        </form>
      </div>

      <div>
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-slate-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    {currency} {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-4 mt-4 flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>{currency} {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
