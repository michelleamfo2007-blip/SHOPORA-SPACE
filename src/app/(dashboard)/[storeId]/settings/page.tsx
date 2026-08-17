import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function SettingsPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({
    where: { id: storeId }
  })

  if (!store) {
    return null
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-slate-500">Manage your store preferences and details.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>Update your store information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Store Name</Label>
              <Input id="name" name="name" defaultValue={store.name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Store URL</Label>
              <div className="flex items-center space-x-2">
                <Input id="slug" name="slug" defaultValue={store.slug} disabled className="flex-1 bg-slate-50" />
                <span className="text-sm text-slate-500 font-medium">.shopora.space</span>
              </div>
              <p className="text-xs text-slate-500">
                To change your URL or add a custom domain, visit the Domains settings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select name="country" defaultValue={store.country}>
                  <SelectTrigger id="country">
                    <SelectValue />
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
                <Select name="currency" defaultValue={store.currency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
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

            <Button type="button" className="w-fit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
