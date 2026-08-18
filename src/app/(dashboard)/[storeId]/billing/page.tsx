import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default async function BillingPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({
    where: { id: storeId },
    include: {
      subscription: true
    }
  })

  if (!store) return null

  const isPro = store.subscription?.planId === "PRO" && store.subscription?.status === "ACTIVE"

  return (
    <div className="grid gap-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h2>
        <p className="text-slate-500">Manage your Shopora subscription plan and billing details.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        {/* Free Plan */}
        <Card className={`relative ${!isPro ? "border-2 border-slate-900" : ""}`}>
          {!isPro && (
            <div className="absolute top-4 right-4 bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-medium">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Basic</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              Free
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Up to 50 Products
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Standard Storefront
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                .shopora.space subdomain
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={!isPro ? "outline" : "default"} disabled={!isPro}>
              {!isPro ? "Active" : "Downgrade to Basic"}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative ${isPro ? "border-2 border-blue-600" : ""}`}>
          {isPro && (
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Pro Shop</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              $29<span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Unlimited Products
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Custom Domains
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Advanced Analytics
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Priority Support
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPro}>
              {isPro ? "Active" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
