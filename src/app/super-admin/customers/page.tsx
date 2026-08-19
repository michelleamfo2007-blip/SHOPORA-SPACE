import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default async function CustomersPage() {
  // We fetch customers across all stores
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: true,
      _count: { select: { orders: true } }
    },
    take: 100 // Limit for now to prevent massive load
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-500" />
            Platform Customers
          </h2>
          <p className="text-slate-500 mt-1">View customers across all store fronts.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Global Customers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Purchased From</th>
                  <th className="px-6 py-4 font-medium">Total Orders</th>
                  <th className="px-6 py-4 font-medium">Total Spent</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No customers have made purchases yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{customer.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{customer.email || "-"}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{customer.store.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{customer._count.orders}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">₵{customer.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                          View Details
                        </Button>
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
