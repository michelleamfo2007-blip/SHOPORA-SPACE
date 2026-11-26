import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { getStorefrontBasePath } from "@/lib/storefront"
import { storeOffersShoporaDelivery } from "@/lib/shopora-delivery-config"
import { CheckoutForm } from "./CheckoutForm"

export default async function CheckoutPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain)
  
  if (!store) notFound()

  const [paymentSetting, basePath] = await Promise.all([
    db.storePaymentSetting.findUnique({ where: { storeId: store.id } }),
    getStorefrontBasePath(domain),
  ])

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-16">
      <p className="store-kicker mb-3">Checkout</p>
      <h1 className="mb-10 font-display text-5xl italic md:mb-14 md:text-6xl">Your order</h1>
      <CheckoutForm 
        storeId={store.id} 
        currency={store.currency} 
        paymentSetting={paymentSetting} 
        deliveryPolicy={store.deliveryPolicy}
        basePath={basePath}
        shoporaDeliveryEnabled={storeOffersShoporaDelivery(store.shoporaDeliveryEnabled)}
      />
    </div>
  )
}
