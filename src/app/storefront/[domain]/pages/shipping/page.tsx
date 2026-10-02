import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"

export default async function ShippingPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const store = await getStoreByHost(domain)

  if (!store) {
    notFound()
  }

  const whatsapp = store.whatsappNumber?.replace(/[^0-9]/g, "")

  return (
    <div className="min-h-screen bg-slate-50 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900">Shipping</h1>
          <div className="mx-auto h-1 w-16 rounded-full" style={{ backgroundColor: store.primaryColor || "#0f172a" }} />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-lg text-slate-600">
            Delivery for <strong>{store.name}</strong> is arranged by the store.
          </p>
          {store.deliveryPolicy ? (
            <p className="mt-6 whitespace-pre-wrap leading-relaxed text-slate-800">{store.deliveryPolicy}</p>
          ) : (
            <p className="mt-6 leading-relaxed text-slate-600">
              {store.name} has not published a delivery policy yet. Message the store before you order so you know the fee and how long it takes.
            </p>
          )}
          {(whatsapp || store.contactEmail) && (
            <p className="mt-8 text-sm text-slate-500">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} className="font-medium text-slate-900 underline" target="_blank" rel="noreferrer">
                  WhatsApp the store
                </a>
              )}
              {whatsapp && store.contactEmail && " · "}
              {store.contactEmail && (
                <a href={`mailto:${store.contactEmail}`} className="font-medium text-slate-900 underline">
                  {store.contactEmail}
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
