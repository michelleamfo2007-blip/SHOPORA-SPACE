"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitPaymentReference } from "@/server/actions/subscription"

export function BillingClient({ storeId, amount }: { storeId: string, amount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      await submitPaymentReference(storeId, formData)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to submit payment.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method Used</Label>
        <Select name="paymentMethod" required>
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BANK_TRANSFER">Bank Transfer (Fidelity / GCB)</SelectItem>
            <SelectItem value="MOMO">Mobile Money (MTN / Telecel / AT)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Transaction Reference / ID</Label>
        <Input 
          id="reference" 
          name="reference" 
          placeholder="e.g. TXN123456789" 
          required 
        />
        <p className="text-xs text-slate-500">
          Enter the transaction ID or reference number from your payment receipt.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "I've Made Payment"}
      </Button>
    </form>
  )
}
