import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createCategoryAction } from "@/server/actions/category"

export default async function CategoriesPage({ params }: { params: { storeId: string } }) {
  const categories = await db.category.findMany({
    where: { storeId: params.storeId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  })

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-slate-500">Organize your products into categories.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Create Category Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCategoryAction} className="grid gap-4">
              <input type="hidden" name="storeId" value={params.storeId} />
              <div className="grid gap-2">
                <Input name="name" placeholder="E.g. Men's Clothing" required />
              </div>
              <Button type="submit" className="w-full">Save Category</Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>URL Slug</TableHead>
                <TableHead className="text-right">Products</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-slate-500">{category.slug}</TableCell>
                    <TableCell className="text-right">{category._count.products}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
