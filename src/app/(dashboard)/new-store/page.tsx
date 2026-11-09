import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { ArrowLeft } from "lucide-react"
import { Toaster } from "sonner"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { TRIAL_PACKAGES } from "@/lib/plans"
import { STORE_CURRENCIES } from "@/lib/store-onboarding"
import { NewStoreForm } from "./NewStoreForm"

export default async function NewStorePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const first = await db.storeMember.findFirst({
    where: { userId: session.user.id, NOT: { store: { slug: { startsWith: "draft-" } } } },
    orderBy: { createdAt: "asc" },
    select: { storeId: true },
  })

  return (
    <div className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {first && (
          <Link href={`/${first.storeId}`} className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-4 w-4" /> Back to my dashboard
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Create another store</h1>
          <p className="mt-1 text-stone-500">
            Run a second brand from the same login. Each store has its own web address, products, orders and plan, and starts with a free month.
          </p>
        </div>
        <NewStoreForm packages={TRIAL_PACKAGES} currencies={STORE_CURRENCIES} />
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
