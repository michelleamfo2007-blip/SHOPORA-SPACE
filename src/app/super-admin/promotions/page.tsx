import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Megaphone, Star, Mail } from "lucide-react"

export default async function MarketingPage() {
  // Fetch products that merchants have marked as featured
  const featuredProducts = await db.product.findMany({
    where: { isFeatured: true },
    include: { store: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-blue-500" />
            Platform Marketing
          </h2>
          <p className="text-slate-500 mt-1">Manage global marketing campaigns, newsletters, and featured platform content.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">0</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Platform-wide promotions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Newsletter Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">1,204</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Subscribed to platform updates</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Featured Products</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{featuredProducts.length}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Highlighted by merchants</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Merchant Featured Products</CardTitle>
          <p className="text-sm text-slate-500 mt-1">A feed of products that merchants have highlighted. These can be used for platform-wide marketing.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {featuredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No featured products found.
                    </td>
                  </tr>
                ) : (
                  featuredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{product.store.name}</td>
                      <td className="px-6 py-4">
                        {product.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            Draft
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
