import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { DeliveryPolicyForm } from "./DeliveryPolicyForm"

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Delivery</h2>
        <p className="text-muted-foreground">Manage delivery instructions for your customers since delivery is handled manually.</p>
      </div>

      <DeliveryPolicyForm storeId={storeId} initialPolicy={store.deliveryPolicy || ""} />
    </div>
  )
}
