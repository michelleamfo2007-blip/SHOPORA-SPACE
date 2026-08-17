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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      store: {
        select: {
          name: true,
          slug: true,
        }
      },
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      store: {
        name: 'asc'
      }
    }
  })

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Categories</h1>
        <p className="text-slate-500 mt-2">Oversight of all product categories created by stores across Shopora.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Showing {categories.length} categories across all stores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Products Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      No categories found on the platform yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {category.slug}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{category.store.name}</span>
                          <span className="text-xs text-slate-500">{category.store.slug}.shopora.space</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={category._count.products > 0 ? "default" : "outline"}>
                          {category._count.products} products
                        </Badge>
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
