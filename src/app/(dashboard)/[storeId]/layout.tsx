import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { DashboardNav } from "@/components/dashboard/nav"
import { Store as StoreIcon, ExternalLink } from "lucide-react"
import { SubscriptionGuard } from "@/components/dashboard/SubscriptionGuard"
import { Toaster } from "sonner"

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Verify the user has access to this store
  const storeMember = await db.storeMember.findUnique({
    where: {
      storeId_userId: {
        storeId,
        userId: session.user.id
      }
    },
    include: {
      store: {
        include: { subscription: true }
      }
    }
  })

  if (!storeMember) {
    // If they don't have access, redirect to their first available store or onboarding
    const firstStore = await db.storeMember.findFirst({
      where: { userId: session.user.id }
    })

    if (firstStore) {
      redirect(`/${firstStore.storeId}`)
    } else {
      redirect("/onboarding")
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 border-r bg-slate-50/50">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center justify-between border-b px-6">
            <div className="flex items-center gap-2 font-semibold">
              <StoreIcon className="h-6 w-6" />
              <span className="truncate w-32">{storeMember.store.name}</span>
            </div>
            <a
              href={`/storefront/${storeMember.store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="View Storefront"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="grid items-start px-4 text-sm font-medium">
              <DashboardNav storeId={storeId} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 w-full flex-col min-h-screen">
        {/* Top Header */}
        <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b bg-slate-50/50 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <DashboardNav storeId={storeId} isMobileMenu />
            <h1 className="font-semibold text-lg hidden md:block">Dashboard</h1>
            <h1 className="font-semibold text-lg md:hidden">{storeMember.store.name}</h1>
            <a
              href={`/storefront/${storeMember.store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-colors md:hidden"
              title="View Storefront"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:block">{session.user.email}</span>
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <SubscriptionGuard
            storeId={storeId}
            status={storeMember.store.subscription?.status || "TRIAL"}
            trialEndDate={storeMember.store.subscription?.currentPeriodEnd?.toISOString() || null}
          >
            {children}
          </SubscriptionGuard>
        </main>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
