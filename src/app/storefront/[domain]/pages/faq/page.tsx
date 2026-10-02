import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"

export default async function FAQPage({ params }: { params: Promise<{ domain: string }> }) {
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
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900">FAQs</h1>
          <div className="mx-auto h-1 w-16 rounded-full" style={{ backgroundColor: store.primaryColor || "#0f172a" }} />
        </div>

        <div className="space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">How do I place an order?</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Choose a product, add it to your cart, then open the cart and check out with your name and delivery details.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">How does delivery work?</h2>
            {store.deliveryPolicy ? (
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-600">{store.deliveryPolicy}</p>
            ) : (
              <p className="mt-3 leading-relaxed text-slate-600">
                {store.name} confirms delivery when you order. The delivery fee is paid to the rider.
              </p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">How do I pay?</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              The payment options for {store.name} are shown at checkout.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">How do I ask about an order?</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Message {store.name} directly
              {whatsapp ? (
                <>
                  {" "}
                  on{" "}
                  <a href={`https://wa.me/${whatsapp}`} className="font-medium text-slate-900 underline" target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </>
              ) : store.contactEmail ? (
                <>
                  {" "}
                  at{" "}
                  <a href={`mailto:${store.contactEmail}`} className="font-medium text-slate-900 underline">
                    {store.contactEmail}
                  </a>
                </>
              ) : (
                " using the contact links in the footer"
              )}
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
