import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { PolicyPage, PolicyText } from "@/components/storefront/PolicyPage"
import { defaultPrivacyPolicy } from "@/lib/store-policies"

export default async function StorePrivacyPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const store = await getStoreByHost(domain)
  if (!store) notFound()

  const text = store.privacyPolicy?.trim() || defaultPrivacyPolicy(store)

  return (
    <PolicyPage
      eyebrow="Help"
      title="Privacy"
      contact={{ storeName: store.name, whatsappNumber: store.whatsappNumber, contactEmail: store.contactEmail }}
    >
      <PolicyText text={text} />
    </PolicyPage>
  )
}
