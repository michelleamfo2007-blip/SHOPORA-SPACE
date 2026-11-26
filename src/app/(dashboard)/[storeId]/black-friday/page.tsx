import { db } from "@/lib/db"
import { getBlackFridayRows } from "@/lib/black-friday-rows"
import { BlackFridayEditor } from "./BlackFridayEditor"

export default async function BlackFridayPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { id: true, currency: true, blackFridayAccess: true, blackFridayOn: true },
  })
  if (!store) return null

  if (!store.blackFridayAccess) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Black Friday</h2>
        <p className="mt-3 text-sm text-stone-500">
          Shopora has not opened Black Friday for this store yet. You will be able to turn the sale on and set
          prices on each item once access is granted.
        </p>
      </div>
    )
  }

  const rows = await getBlackFridayRows(storeId)

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Black Friday</h2>
        <p className="mt-1 text-slate-500">
          Turn the sale on when you are ready, then set the price you want on each item. Your regular prices are not
          overwritten.
        </p>
      </div>
      <BlackFridayEditor storeId={store.id} currency={store.currency} saleOn={store.blackFridayOn} rows={rows} />
    </div>
  )
}
