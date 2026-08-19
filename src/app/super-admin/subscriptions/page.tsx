import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { SubscriptionsClient } from "./SubscriptionsClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"

export default async function AdminSubscriptionsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  const payments = await db.subscriptionPayment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        include: {
          store: true,
          plan: true
        }
      }
    }
  })

  const pendingPayments = payments.filter(p => p.status === "PENDING")
  const historyPayments = payments.filter(p => p.status !== "PENDING")

  return (
    <div className="space-y-8 pb-10 px-6 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-500" />
            Vendor Subscriptions
          </h2>
          <p className="text-slate-500 mt-1">Approve or reject manual payment submissions.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Pending Approvals</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Verify the reference numbers against your Bank/MoMo alerts before approving.</p>
        </CardHeader>
        <CardContent className="p-0">
          {pendingPayments.length === 0 ? (
            <div className="text-sm font-medium text-slate-500 py-12 text-center bg-white">
              No pending payments.
            </div>
          ) : (
            <SubscriptionsClient payments={pendingPayments} />
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyPayments.length === 0 ? (
            <div className="text-sm font-medium text-slate-500 py-12 text-center bg-white">
              No payment history.
            </div>
          ) : (
            <SubscriptionsClient payments={historyPayments} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
