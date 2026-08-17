import { db } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModerationStatusToggle } from "./ModerationClient"

export default async function ModerationPage() {
  const stores = await db.store.findMany({
    include: {
      _count: {
        select: { products: true, orders: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Moderation</h1>
        <p className="text-slate-500 mt-2">Manage all merchant stores, enforce guidelines, and handle suspensions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
          <CardDescription>
            {stores.length} total stores registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Details</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Moderation Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No stores have been created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{store.name}</span>
                          <span className="text-xs text-slate-500">{store.slug}.shopora.space</span>
                        </div>
                      </TableCell>
                      <TableCell>{store.country}</TableCell>
                      <TableCell className="text-right">{store._count.products}</TableCell>
                      <TableCell className="text-right">{store._count.orders}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <ModerationStatusToggle storeId={store.id} status={store.status} />
                        </div>
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
  );
}
