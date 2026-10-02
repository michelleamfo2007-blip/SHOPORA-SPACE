"use client"

import { usePathname, useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSubscriptionLapsed } from "@/lib/subscription"

export function SubscriptionGuard({ 
  storeId, 
  status, 
  trialEndDate,
  children 
}: { 
  storeId: string, 
  status: string, 
  trialEndDate: string | null,
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const router = useRouter()

  const isLocked = isSubscriptionLapsed({ status, currentPeriodEnd: trialEndDate })

  const isBillingPage = pathname.endsWith('/billing')

  if (isLocked && !isBillingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Store Locked</h2>
        <p className="text-slate-600 max-w-md mb-8">
          Your free trial or subscription has ended, and your store is closed to customers.
          Make a payment to reopen your store and restore access to your dashboard.
        </p>
        <Button size="lg" onClick={() => router.push(`/${storeId}/billing`)}>
          Go to Billing & Subscription
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
