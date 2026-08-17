import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { DashboardNav } from "@/components/dashboard/nav"
import { Store as StoreIcon } from "lucide-react"

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
      store: true
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-slate-50/50 lg:block lg:w-64">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <div className="flex items-center gap-2 font-semibold">
              <StoreIcon className="h-6 w-6" />
              <span className="">{storeMember.store.name}</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="grid items-start px-4 text-sm font-medium">
              <DashboardNav storeId={storeId} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-col">
        {/* Top Header */}
        <header className="flex h-[60px] items-center gap-4 border-b bg-slate-50/50 px-6">
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{session.user.email}</span>
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
