import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { getBulkRows } from "@/lib/bulk-products"
import { BulkEditor } from "./BulkEditor"

export default async function BulkEditPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const [store, rows] = await Promise.all([
    db.store.findUnique({ where: { id: storeId }, select: { currency: true } }),
    getBulkRows(storeId),
  ])

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link href={`/${storeId}/products`} className="text-stone-500 hover:text-stone-900" aria-label="Back to products">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Bulk edit prices &amp; stock</h1>
          <p className="text-sm text-stone-500">
            Change as many rows as you like, then save once. Cost price is what you paid — it&apos;s used for profit and never shown to customers.
          </p>
        </div>
      </div>
      <BulkEditor storeId={storeId} currency={store?.currency ?? "GHS"} rows={rows} />
    </div>
  )
}
