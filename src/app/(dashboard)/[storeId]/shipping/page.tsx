import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { DeliveryPolicyForm } from "./DeliveryPolicyForm"
import { ShoporaDeliveryForm } from "./ShoporaDeliveryForm"
import { Truck } from "lucide-react"
import { SHOPORA_DELIVERY_LIVE, SHOPORA_DELIVERY_PAUSED_MESSAGE } from "@/lib/shopora-delivery-config"
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
          <p className="text-slate-500 mt-1">
            {SHOPORA_DELIVERY_LIVE
              ? "Your own delivery notes, plus optional Shopora Delivery for Accra."
              : "Tell customers how you deliver. Shopora Delivery is paused for now."}
          </p>
        </div>
      </div>

      {SHOPORA_DELIVERY_LIVE ? (
        <ShoporaDeliveryForm
          storeId={storeId}
          enabled={store.shoporaDeliveryEnabled}
          pickupAddress={store.pickupAddress || ""}
          pickupCity={store.pickupCity || "Accra"}
        />
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
          {SHOPORA_DELIVERY_PAUSED_MESSAGE}
        </div>
      )}

      <DeliveryPolicyForm storeId={storeId} initialPolicy={store.deliveryPolicy || ""} />
    </div>
  )
}
