import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createDiscountAction } from "@/server/actions/discount"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default async function NewDiscountPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  // Wrap the server action to pass the storeId
  const createDiscount = createDiscountAction.bind(null, storeId)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Discount</h2>
        <p className="text-muted-foreground">Add a new promo code for your customers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Details</CardTitle>
          <CardDescription>
            Promo codes are applied at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createDiscount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code</Label>
              <Input id="code" name="code" placeholder="e.g. SUMMER20" required className="uppercase" />
              <p className="text-xs text-muted-foreground">Customers will enter this code at checkout.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select name="type" defaultValue="PERCENTAGE">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Discount Value</Label>
                <Input id="value" name="value" type="number" min="0" step="0.01" placeholder="e.g. 20" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
              <Input id="usageLimit" name="usageLimit" type="number" min="1" placeholder="e.g. 100" />
              <p className="text-xs text-muted-foreground">Leave blank for unlimited uses.</p>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/${storeId}/discounts`}>
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit">Create Discount</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
