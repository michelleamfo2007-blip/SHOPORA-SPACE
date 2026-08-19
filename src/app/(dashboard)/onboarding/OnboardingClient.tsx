"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { completeSetupAction } from "@/server/actions/store"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function OnboardingClient() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await completeSetupAction(formData)
      if (result?.error) {
        setLoading(false)
        setError(result.error)
      } else if (result?.redirectUrl) {
        router.push(result.redirectUrl)
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "An unexpected error occurred.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your store setup</CardTitle>
          <CardDescription>
            You're almost there! Tell us the details of your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. My Awesome Shop"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Store URL</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="slug"
                  name="slug"
                  placeholder="myawesomeshop"
                  className="flex-1"
                  required
                />
                <span className="text-sm text-slate-500 font-medium">.shopora.space</span>
              </div>
              <p className="text-xs text-slate-500">
                This will be your initial store address. You can connect a custom domain later.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select name="country" required defaultValue="GH">
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select name="currency" required defaultValue="GHS">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS (Ghana Cedi)</SelectItem>
                    <SelectItem value="NGN">NGN (Naira)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Creating Store..." : "Create Store"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
