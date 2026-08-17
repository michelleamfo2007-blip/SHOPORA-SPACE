import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createShippingZoneAction } from "@/server/actions/shipping"
import { DeleteZoneButton, DeleteRateButton, AddRateForm } from "./ShippingClient"
import { Plus } from "lucide-react"

export default async function ShippingPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  const zones = await db.shippingZone.findMany({
    where: { storeId },
    include: { rates: true }
  })

  const createZone = createShippingZoneAction.bind(null, storeId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Shipping</h2>
        <p className="text-muted-foreground">Manage shipping zones and delivery rates for your customers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Shipping Zone</CardTitle>
          <CardDescription>
            Zones group countries or regions that share the same shipping rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createZone} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Zone Name</Label>
              <Input id="name" name="name" placeholder="e.g. Domestic, Europe, Rest of World" required />
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Zone
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {zones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p>No shipping zones configured.</p>
              <p className="text-sm">Create a zone above to start adding shipping rates.</p>
            </CardContent>
          </Card>
        ) : (
          zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{zone.name}</CardTitle>
                  <CardDescription>Manage rates for this zone.</CardDescription>
                </div>
                <DeleteZoneButton storeId={storeId} zoneId={zone.id} />
              </CardHeader>
              <CardContent>
                {zone.rates.length > 0 && (
                  <div className="rounded-md border mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rate Name</TableHead>
                          <TableHead>Estimated Delivery</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {zone.rates.map((rate) => (
                          <TableRow key={rate.id}>
                            <TableCell className="font-medium">{rate.name}</TableCell>
                            <TableCell>{rate.estimatedDays || "N/A"}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-600">
                              ${rate.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <DeleteRateButton storeId={storeId} rateId={rate.id} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <AddRateForm storeId={storeId} zoneId={zone.id} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
