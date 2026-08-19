import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutList } from "lucide-react"
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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutList className="w-8 h-8 text-amber-500" />
            Platform Categories
          </h2>
          <p className="text-slate-500 mt-1">Oversight of all product categories created by stores across Shopora.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">All Categories</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Showing {categories.length} categories across all stores.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4 text-right">Products Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No categories found on the platform yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{category.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-mono font-medium text-slate-700 border border-slate-200">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{category.store.name}</span>
                          <span className="text-xs font-medium text-slate-500 mt-0.5">{category.store.slug}.shopora.space</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {category._count.products > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            {category._count.products} products
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            0 products
                          </span>
                        )}
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
  );
}
