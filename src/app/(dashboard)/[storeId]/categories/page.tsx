import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid } from "lucide-react"
import { createCategoryAction } from "@/server/actions/category"

export default async function CategoriesPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const categories = await db.category.findMany({
    where: { storeId: storeId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-pink-500" />
            Categories
          </h2>
          <p className="text-slate-500 mt-1">Organize your products into categories.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Create Category Form */}
        <Card className="h-fit border-0 shadow-sm bg-white rounded-xl overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-slate-900">Add New Category</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form action={createCategoryAction} className="grid gap-4">
              <input type="hidden" name="storeId" value={storeId} />
              <div className="grid gap-2">
                <Input name="name" placeholder="E.g. Men's Clothing" required className="rounded-lg border-slate-200" />
              </div>
              <Button type="submit" className="w-full bg-slate-900 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-slate-800 transition-colors shadow-sm">Save Category</Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-slate-900">All Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4">URL Slug</th>
                    <th className="px-6 py-4 text-right">Products</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-900">{category.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">{category.slug}</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-700">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {category._count.products} Products
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
