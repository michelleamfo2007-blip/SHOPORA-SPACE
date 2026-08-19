import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default async function CustomersPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const customers = await db.customer.findMany({
    where: { storeId },
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Customers
          </h2>
          <p className="text-slate-500 mt-1">View and manage the people who have bought from you.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Customer Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-right">Total Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {customer.name.substring(0, 2)}
                          </div>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{customer.email}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">{customer.phone || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {customer._count.orders} Orders
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
  )
}
