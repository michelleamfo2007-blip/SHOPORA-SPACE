import { db } from "@/lib/db"
import { getTillProducts, getTillSummary } from "@/lib/pos"
import { storeHasFeature } from "@/lib/store-plan"
import { UpgradeCard } from "@/components/dashboard/UpgradeCard"
import { TillClient } from "./TillClient"

export default async function PosPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const allowed = await storeHasFeature(storeId, "pos")
  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Shop till</h1>
        <UpgradeCard storeId={storeId} feature="pos" />
      </div>
    )
  }

  const [store, items, summary] = await Promise.all([
    db.store.findUnique({ where: { id: storeId }, select: { currency: true, name: true } }),
    getTillProducts(storeId),
    getTillSummary(storeId),
  ])

  return (
    <TillClient
      storeId={storeId}
      storeName={store?.name ?? "Your store"}
      currency={store?.currency ?? "GHS"}
      items={items}
      initialSummary={JSON.parse(JSON.stringify(summary))}
    />
  )
}
