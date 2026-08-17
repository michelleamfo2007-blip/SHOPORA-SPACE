import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Customers</h1>
        <p className="text-slate-500 mt-2">View customers across all store fronts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
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
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                      <td className="px-6 py-4">{customer.email || "-"}</td>
                      <td className="px-6 py-4 text-slate-500">{customer.store.name}</td>
                      <td className="px-6 py-4 text-slate-500">{customer._count.orders}</td>
                      <td className="px-6 py-4 font-medium">${customer.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm">
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
