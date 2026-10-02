import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"

export default async function RefundsPage({ params }: { params: Promise<{ domain: string }> }) {
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
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900">Returns</h1>
          <div className="mx-auto h-1 w-16 rounded-full" style={{ backgroundColor: store.primaryColor || "#0f172a" }} />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-lg leading-relaxed text-slate-600">
            Returns for <strong>{store.name}</strong> are handled by the store. Contact them before you send anything back.
          </p>
          {(whatsapp || store.contactEmail) && (
            <p className="mt-6 text-slate-800">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} className="font-medium underline" target="_blank" rel="noreferrer">
                  WhatsApp {store.name}
                </a>
              )}
              {whatsapp && store.contactEmail && " · "}
              {store.contactEmail && (
                <a href={`mailto:${store.contactEmail}`} className="font-medium underline">
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
