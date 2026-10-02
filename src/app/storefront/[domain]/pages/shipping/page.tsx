import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { PolicyPage, PolicySection } from "@/components/storefront/PolicyPage"

export default async function ShippingPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const store = await getStoreByHost(domain)

  if (!store) {
    notFound()
  }

  return (
    <PolicyPage
      eyebrow="Help"
      title="Delivery"
      contact={{ storeName: store.name, whatsappNumber: store.whatsappNumber, contactEmail: store.contactEmail }}
    >
      <PolicySection title="How it works">
        {store.deliveryPolicy ||
          `${store.name} has not published a delivery policy yet. Message the store before you order so you know the fee and how long it takes.`}
      </PolicySection>
      <PolicySection title="Delivery fee">
        The delivery fee is not included in your order total. You pay the rider when your order arrives.
      </PolicySection>
    </PolicyPage>
  )
}
