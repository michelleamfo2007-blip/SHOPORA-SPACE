import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getShareKit } from "@/lib/share-kit"
import { ShareActions } from "./ShareActions"
import { storeHasFeature } from "@/lib/store-plan"
import { UpgradeCard } from "@/components/dashboard/UpgradeCard"

export default async function ShareKitPage({ params }: { params: Promise<{ storeId: string; productId: string }> }) {
  const { storeId, productId } = await params
  const [kit, allowed] = await Promise.all([getShareKit(storeId, productId), storeHasFeature(storeId, "shareKit")])
  if (!kit) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link href={`/${storeId}/products/${productId}`} className="text-stone-500 hover:text-stone-900" aria-label="Back to product">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Share kit · {kit.name}</h1>
          <p className="text-sm text-stone-500">Ready-made images and a caption for WhatsApp Status and Instagram.</p>
        </div>
      </div>

      {!allowed ? (
        <UpgradeCard storeId={storeId} feature="shareKit" />
      ) : (
        <>
          {!kit.isLive && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This product is hidden or a draft, so the images and link won&apos;t work for customers until you publish it.
            </p>
          )}
          <ShareActions kit={kit} />
        </>
      )}
    </div>
  )
}
