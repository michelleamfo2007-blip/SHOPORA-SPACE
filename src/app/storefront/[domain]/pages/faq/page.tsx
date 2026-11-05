import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { PolicyPage, PolicySection } from "@/components/storefront/PolicyPage"

export default async function FAQPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const store = await getStoreByHost(domain)

  if (!store) {
    notFound()
  }

  return (
    <PolicyPage
      eyebrow="Help"
      title="FAQs"
      contact={{ storeName: store.name, whatsappNumber: store.whatsappNumber, contactEmail: store.contactEmail }}
    >
      <PolicySection title="How do I place an order?">
        Choose a product, add it to your bag, then check out with your name and delivery details.
      </PolicySection>
      <PolicySection title="How does delivery work?">
        {store.deliveryPolicy || `${store.name} confirms delivery when you order. The delivery fee is paid to the rider.`}
      </PolicySection>
      <PolicySection title="How do I pay?">
        The payment options for {store.name} are shown at checkout. After you pay, enter your transaction ID so the store can confirm it.
      </PolicySection>
      <PolicySection title="How do I ask about an order?">
        Message {store.name} directly with your order reference using the contact details below.
      </PolicySection>
    </PolicyPage>
  )
}
