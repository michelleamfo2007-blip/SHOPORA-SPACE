import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { MANUAL_ORDER_SOURCES, listSellableVariants } from "@/lib/manual-order"
import { ManualOrderForm } from "./ManualOrderForm"

export default async function NewManualOrderPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const [store, items] = await Promise.all([
    db.store.findUnique({ where: { id: storeId }, select: { currency: true } }),
    listSellableVariants(storeId),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link href={`/${storeId}/orders`} className="text-stone-500 hover:text-stone-900" aria-label="Back to orders">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Record an order</h1>
          <p className="text-sm text-stone-500">
            For sales on WhatsApp, Instagram, by phone or in person. Stock is taken off so your website never oversells.
          </p>
        </div>
      </div>
      <ManualOrderForm
        storeId={storeId}
        currency={store?.currency ?? "GHS"}
        items={items}
        sources={MANUAL_ORDER_SOURCES.map((s) => ({ value: s.value, label: s.label }))}
      />
    </div>
  )
}
