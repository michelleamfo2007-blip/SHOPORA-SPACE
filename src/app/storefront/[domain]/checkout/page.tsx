import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { CheckoutForm } from "./CheckoutForm"

export default async function CheckoutPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain)
  
  if (!store) notFound()

  const paymentSetting = await db.storePaymentSetting.findUnique({
    where: { storeId: store.id }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Checkout
        </h1>
        <CheckoutForm 
          storeId={store.id} 
          currency={store.currency} 
          paymentSetting={paymentSetting} 
          deliveryPolicy={store.deliveryPolicy}
        />
      </div>
    </div>
  )
}
