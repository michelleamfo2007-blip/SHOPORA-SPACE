import { db } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowUpRight } from "lucide-react"

export default async function InventoryPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  
  const products = await db.product.findMany({
    where: { storeId },
    include: {
      variants: {
        include: {
          optionValues: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Flatten products into variants for the inventory view
  const variants = products.flatMap((p: any) => 
    (p.variants as any[]).map((v: any) => ({
      ...v,
      productName: p.name,
      status: p.isActive ? "Active" : "Draft"
    }))
  )

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-slate-500">Track and adjust stock levels across all your product variants.</p>
        </div>
        <Button>Update Stock</Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant Details</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Available Stock</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No inventory items found. Add products to manage stock.
                </TableCell>
              </TableRow>
            ) : (
              variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">
                    {variant.productName}
                  </TableCell>
                  <TableCell>
                    {variant.optionValues.length > 0 ? (
                      <span className="text-sm text-slate-500">
                        {variant.optionValues.map(ov => ov.value).join(" / ")}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Default Title</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {variant.sku || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant.status === "Active" ? "default" : "secondary"}>
                      {variant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {variant.stockCount <= 5 && (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className={`font-medium ${variant.stockCount <= 0 ? 'text-red-600' : ''}`}>
                        {variant.stockCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Edit</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
