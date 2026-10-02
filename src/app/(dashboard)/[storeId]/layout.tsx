import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { DashboardNav } from "@/components/dashboard/nav"
import { ExternalLink } from "lucide-react"
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
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-950 lg:flex-row">
      <div className="hidden w-60 border-r border-stone-200 bg-stone-50 lg:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-14 items-center px-5">
            <p className="truncate text-sm font-semibold">{storeMember.store.name}</p>
          </div>
          <div className="flex-1 overflow-auto px-3 pb-6">
            <DashboardNav storeId={storeId} />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen w-full max-w-full flex-1 flex-col overflow-x-hidden">
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <DashboardNav storeId={storeId} isMobileMenu />
            <p className="text-sm font-semibold lg:hidden">{storeMember.store.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`/storefront/${storeMember.store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-950"
            >
              View store <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="hidden text-sm text-stone-500 md:block">{session.user.email}</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
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
