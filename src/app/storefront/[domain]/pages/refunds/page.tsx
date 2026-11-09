import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { PolicyPage, PolicySection, PolicyText } from "@/components/storefront/PolicyPage"

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
      {store.returnPolicy?.trim() ? (
        <PolicyText text={store.returnPolicy} />
      ) : (
        <DefaultReturns storeName={store.name} />
      )}
    </PolicyPage>
  )
}

function DefaultReturns({ storeName }: { storeName: string }) {
  const store = { name: storeName }
  return (
    <>
      <PolicySection title="Our policy">
        Returns for {store.name} are handled by the store. Contact them before you send anything back.
      </PolicySection>
      <PolicySection title="Wrong or damaged item?">
        {`Message ${store.name} as soon as your order arrives, with your order reference and a photo of the item, so they can sort it out.`}
      </PolicySection>
      <PolicySection title="How refunds are paid">
        {`If ${store.name} agrees to a refund, they send it back the way you paid — Mobile Money or bank transfer.`}
      </PolicySection>
    </>
  )
}
