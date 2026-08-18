import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { SubscriptionsClient } from "./SubscriptionsClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Subscriptions</h1>
        <p className="text-muted-foreground">Approve or reject manual payment submissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Verify the reference numbers against your Bank/MoMo alerts before approving.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-sm text-slate-500 py-4 text-center border rounded-md bg-slate-50">
              No pending payments.
            </div>
          ) : (
            <SubscriptionsClient payments={pendingPayments} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyPayments.length === 0 ? (
            <div className="text-sm text-slate-500 py-4 text-center border rounded-md bg-slate-50">
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
