import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { PolicyPage, PolicySection } from "@/components/storefront/PolicyPage"

export default async function RefundsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const store = await getStoreByHost(domain)

  if (!store) {
    notFound()
  }

  return (
    <PolicyPage
      eyebrow="Help"
      title="Returns"
      contact={{ storeName: store.name, whatsappNumber: store.whatsappNumber, contactEmail: store.contactEmail }}
    >
      <PolicySection title="Our policy">
        Returns for {store.name} are handled by the store. Contact them before you send anything back.
      </PolicySection>
    </PolicyPage>
  )
}
