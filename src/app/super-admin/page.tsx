export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"

export default async function SuperAdminOverview() {
  const [totalStores, totalUsers, pendingApprovals, activeSubs, trialSubs, revenueAgg] = await Promise.all([
    db.store.count(),
    db.user.count(),
    db.subscriptionPayment.count({ where: { status: "PENDING" } }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "TRIAL" } }),
    db.subscriptionPayment.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    }),
  ])

  const platformRevenue = revenueAgg._sum.amount || 0

  const cards = [
    { label: "Total Sellers", detail: "Active stores on platform", value: String(totalStores), href: "/super-admin/sellers" },
    { label: "Total Customers", detail: "Registered users", value: String(totalUsers), href: "/super-admin/customers" },
    { label: "Active Subs", detail: "Paying stores", value: String(activeSubs), href: "/super-admin/subscriptions" },
    { label: "Free Trials", detail: "Stores on trial", value: String(trialSubs), href: "/super-admin/subscriptions" },
    { label: "Platform Revenue", detail: "From subscriptions", value: `GH₵ ${platformRevenue.toFixed(2)}`, href: "/super-admin/finance" },
    { label: "Pending Approvals", detail: "Payments waiting for review", value: String(pendingApprovals), href: "/super-admin/subscriptions", warn: pendingApprovals > 0 },
    { label: "Active Disputes", detail: "Store suspensions", value: "0", href: "/super-admin/moderation" },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Platform</h1>
        <p className="mt-1 text-stone-500">Stores, trials, and subscription payments.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => (
          <Link key={item.label} href={item.href} className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950">
            <Card className="h-full border-stone-200 bg-white shadow-none transition-colors hover:border-stone-400">
              <CardContent className="p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className={`mt-2 text-3xl font-semibold ${item.warn ? "text-red-600" : "text-stone-950"}`}>{item.value}</p>
                <p className="mt-1 text-xs text-stone-500">{item.detail}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
