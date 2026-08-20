import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BillingClient } from "./BillingClient"

export default async function BillingPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const store = await db.store.findUnique({
    where: { id: storeId },
    include: {
      subscription: {
        include: { plan: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } }
      }
    }
  })

  if (!store || !store.subscription || !store.subscription.plan) {
    return (
      <div className="p-6 max-w-4xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>No active subscription found for this store.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { subscription } = store
  const { plan, payments } = subscription
  const latestPayment = payments && payments.length > 0 ? payments[0] : null

  const isTrial = subscription.status === "TRIAL"
  const isPastDue = subscription.status === "PAST_DUE"
  const isActive = subscription.status === "ACTIVE"
  
  const trialEndsAt = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
  const trialEnded = trialEndsAt && trialEndsAt < new Date()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-slate-500 mt-2">Manage your subscription and payments to keep your store active.</p>
        </div>
        <Badge variant={isActive ? "default" : isPastDue ? "destructive" : "secondary"} className="text-sm px-4 py-1">
          {subscription.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Package</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Price</span>
              <span className="font-semibold">GH₵ {plan.price.toFixed(2)} / {plan.interval}</span>
            </div>
            {trialEndsAt && (
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Trial Ends</span>
                <span className={`font-semibold ${trialEnded ? "text-red-500" : "text-green-600"}`}>
                  {trialEndsAt.toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {latestPayment && latestPayment.status === "PENDING" ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">Payment Pending Verification</CardTitle>
              <CardDescription className="text-blue-600">
                You submitted a payment reference on {latestPayment.createdAt.toLocaleDateString()}. 
                Our team is currently verifying it. Once verified, your subscription will be activated.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className={isPastDue ? "border-red-200" : ""}>
            <CardHeader>
              <CardTitle>Manual Payment</CardTitle>
              <CardDescription>
                {isTrial && !trialEnded && "Your trial is active! You can pay now to ensure uninterrupted service."}
                {(isPastDue || trialEnded) && "Your trial has ended. Please make a payment to restore access to your store."}
                {isActive && "Your subscription is active. Make a payment to renew for the next period."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BillingClient storeId={store.id} amount={plan.price} />
            </CardContent>
          </Card>
        )}
      </div>

      {(!latestPayment || latestPayment.status !== "PENDING") && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
            <CardDescription>Send your payment via one of the methods below.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Bank Transfer
              </h3>
              <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-3">
                <div>
                  <div className="text-slate-500 mb-1">Fidelity Bank</div>
                  <div className="font-mono font-medium">2100377615010</div>
                  <div className="text-xs mt-1 text-slate-600">Name: MICHELLE AMFO</div>
                </div>
                <div className="border-t pt-3">
                  <div className="text-slate-500 mb-1">GCB Bank</div>
                  <div className="font-mono font-medium">1741250000618</div>
                  <div className="text-xs mt-1 text-slate-600">Name: MICHELLE AMFO</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Mobile Money
              </h3>
              <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-3">
                <div>
                  <div className="text-slate-500 mb-1">MTN / Telecel / AT (All Networks)</div>
                  <div className="font-mono font-medium text-lg tracking-wider text-green-600">0549789315</div>
                  <div className="text-xs mt-1 text-slate-600">Name: MICHELLE AMFO</div>
                </div>
                <p className="text-xs text-slate-500 italic mt-4">
                  Please include your Store URL as the reference when making the transfer if possible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
