import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DiscountToggle, DeleteDiscountButton } from "./DiscountsClient"

export default async function DiscountsPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  const discounts = await db.discount.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">Manage promotional codes and cart discounts.</p>
        </div>
        <Button asChild>
          <Link href={`/${storeId}/discounts/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Discount
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Promo Codes</CardTitle>
          <CardDescription>
            Codes that customers can apply at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No discounts created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  discounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium font-mono">
                        {discount.code}
                      </TableCell>
                      <TableCell>
                        {discount.type === "PERCENTAGE" ? `${discount.value}% OFF` : `$${discount.value.toFixed(2)} OFF`}
                      </TableCell>
                      <TableCell>
                        {discount.timesUsed} / {discount.usageLimit ? discount.usageLimit : "∞"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DiscountToggle storeId={storeId} discountId={discount.id} initialIsActive={discount.isActive} />
                          <Badge variant={discount.isActive ? "default" : "secondary"}>
                            {discount.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteDiscountButton storeId={storeId} discountId={discount.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
