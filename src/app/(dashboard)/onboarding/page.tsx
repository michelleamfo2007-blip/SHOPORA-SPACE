import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createStoreAction } from "@/server/actions/store"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create your store</CardTitle>
          <CardDescription>
            Let's get started by creating your online store. You can change these details later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createStoreAction} className="grid gap-6">
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

            <Button type="submit" className="w-full mt-4">
              Create Store
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

