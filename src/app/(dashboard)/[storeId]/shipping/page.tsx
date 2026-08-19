import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { DeliveryPolicyForm } from "./DeliveryPolicyForm"
import { Truck } from "lucide-react"
export default async function ShippingPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  const store = await db.store.findUnique({
    where: { id: storeId }
  })

  if (!store) {
    notFound()
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Truck className="w-8 h-8 text-teal-500" />
            Delivery
          </h2>
          <p className="text-slate-500 mt-1">Manage delivery instructions for your customers since delivery is handled manually.</p>
        </div>
      </div>

      <DeliveryPolicyForm storeId={storeId} initialPolicy={store.deliveryPolicy || ""} />
    </div>
  )
}
