import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DiscountToggle, DeleteDiscountButton } from "./DiscountsClient"

export default async function DiscountsPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  const discounts = await db.discount.findMany({
    where: { storeId },
    orderBy: { startDate: 'desc' }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Plus className="w-8 h-8 text-rose-500" />
            Discounts
          </h2>
          <p className="text-slate-500 mt-1">Manage promotional codes and cart discounts.</p>
        </div>
        <Link href={`/${storeId}/discounts/new`}>
          <Button className="bg-slate-900 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Discount
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Active Promo Codes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Usage Limit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No discounts created yet.
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 bg-blue-50/50 rounded-l-lg m-1">
                        {discount.code}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {discount.type === "PERCENTAGE" ? `${discount.value}% OFF` : `$${discount.value.toFixed(2)} OFF`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {discount.timesUsed} / {discount.usageLimit ? discount.usageLimit : "∞"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <DiscountToggle storeId={storeId} discountId={discount.id} initialIsActive={discount.isActive} />
                          {discount.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DeleteDiscountButton storeId={storeId} discountId={discount.id} />
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
