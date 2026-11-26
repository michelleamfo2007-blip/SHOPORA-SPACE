import Link from "next/link"
import { Check } from "lucide-react"
import { getStoreByHost } from "@/lib/tenant"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getStorefrontBasePath } from "@/lib/storefront"
import { StorefrontReviewForm } from "@/components/storefront/StorefrontReviewForm"

export default async function CheckoutSuccessPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ domain: string }>,
  searchParams: Promise<{ orderId?: string; track?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const store = await getStoreByHost(resolvedParams.domain)
  if (!store) notFound()

  const basePath = await getStorefrontBasePath(resolvedParams.domain)

  let order = null;
  if (resolvedSearchParams.orderId) {
    order = await db.order.findFirst({
      where: { 
        storeId: store.id,
        orderNumber: resolvedSearchParams.orderId
      },
      include: {
        orderItems: {
          include: { variant: true }
        }
      }
    })
  }

  const trackingToken = resolvedSearchParams.track || order?.trackingToken
  const whatsapp = store.whatsappNumber?.replace(/[^0-9]/g, "")

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center md:py-28">
      <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center border border-[var(--store-ink)]">
        <Check className="h-6 w-6" strokeWidth={1.25} />
      </div>
      <p className="store-kicker">Thank you</p>
      <h1 className="mt-4 font-display text-5xl md:text-6xl">Your order is in</h1>
      <p className="mx-auto mt-5 max-w-md leading-relaxed text-stone-600">
        {store.name} will check your payment and confirm your order shortly. Keep your order reference in case you need to ask about it.
      </p>

      {resolvedSearchParams.orderId && (
        <div className="mx-auto mt-10 max-w-xs border border-[var(--store-line)] px-6 py-5">
          <p className="store-kicker">Order reference</p>
          <p className="mt-1 font-display text-2xl tracking-wide">{resolvedSearchParams.orderId}</p>
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {trackingToken && (
          <Link
            href={`/track/${trackingToken}`}
            className="store-btn"
          >
            Track delivery
          </Link>
        )}
        <Link
          href={`${basePath}/products`}
          className={trackingToken ? "store-btn-ghost" : "store-btn"}
        >
          Continue shopping
        </Link>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi ${store.name}, I just placed order ${resolvedSearchParams.orderId ?? ""}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="store-btn-ghost"
          >
            Message the store
          </a>
        )}
      </div>

      {order && order.orderItems.length > 0 && (
        <div className="mt-16 border-t border-stone-200 pt-12">
          <StorefrontReviewForm domain={resolvedParams.domain} productId={order.orderItems[0].variant.productId} />
        </div>
      )}
    </div>
  )
}
