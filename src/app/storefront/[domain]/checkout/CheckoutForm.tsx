"use client"

import { useCart } from "@/lib/cart"
import { processCheckoutAction } from "@/server/actions/checkout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function CheckoutForm({ 
  storeId, 
  currency, 
  paymentSetting 
}: { 
  storeId: string; 
  currency: string;
  paymentSetting: any; 
}) {
  const { items, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getHomeUrl = () => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith('/storefront/')) {
      const parts = window.location.pathname.split('/')
      return `/storefront/${parts[2]}`
    }
    return "/"
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Your cart is empty</h2>
        <Button size="lg" onClick={() => router.push(getHomeUrl())}>Continue Shopping</Button>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      formData.append("storeId", storeId)
      formData.append("cartData", JSON.stringify(items))
      
      const { orderId } = await processCheckoutAction(formData)
      
      clearCart()
      alert("Order placed successfully! We will verify your payment shortly. Order ID: " + orderId)
      router.push(getHomeUrl())
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
        <form id="checkout-form" action={handleSubmit} className="grid gap-6">
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

          <h2 className="text-2xl font-bold mt-8 mb-2">Payment Verification</h2>
          <p className="text-sm text-slate-500 mb-4">
            Please make the transfer using the details on the right, and provide your reference number below.
          </p>
          <div className="grid gap-2">
            <Label htmlFor="paymentReference">Transaction ID / Payment Reference</Label>
            <Input id="paymentReference" name="paymentReference" required placeholder="e.g. 0541234567 or TXN-999" />
          </div>

          <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Complete Order"}
          </Button>
        </form>
      </div>

      <div className="space-y-8">
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
                <span>Total Due</span>
                <span className="text-blue-600">{currency} {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Pay</CardTitle>
            <CardDescription className="text-blue-700">
              Transfer exactly <strong>{currency} {getTotalPrice().toFixed(2)}</strong> to the account below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-900">
            {!paymentSetting ? (
              <p className="text-sm text-red-600 font-medium">This store has not configured payment details yet.</p>
            ) : (
              <>
                {paymentSetting.bankName && (
                  <div className="bg-white p-3 rounded-md border border-blue-100 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1">Bank Transfer</p>
                    <p className="font-medium">{paymentSetting.bankName}</p>
                    <p className="text-lg font-bold tracking-tight">{paymentSetting.accountNumber}</p>
                    <p className="text-sm">{paymentSetting.accountName}</p>
                  </div>
                )}

                {paymentSetting.mobileMoneyNumber && (
                  <div className="bg-white p-3 rounded-md border border-blue-100 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1">Mobile Money</p>
                    <p className="text-lg font-bold tracking-tight">{paymentSetting.mobileMoneyNumber}</p>
                    {paymentSetting.accountName && <p className="text-sm">{paymentSetting.accountName}</p>}
                  </div>
                )}

                {paymentSetting.instructions && (
                  <div className="text-sm bg-blue-100/50 p-3 rounded-md">
                    <strong>Instructions:</strong> {paymentSetting.instructions}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
