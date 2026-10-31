import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"

const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Payment confirmed" },
  { key: "rider", label: "Rider assigned" },
  { key: "picked", label: "Picked up" },
  { key: "delivered", label: "Delivered" },
] as const

function activeStep(orderStatus: string, jobStatus: string | null): number {
  if (orderStatus === "DELIVERED" || jobStatus === "DELIVERED") return 4
  if (jobStatus === "PICKED_UP" || orderStatus === "SHIPPED") return 3
  if (jobStatus === "ASSIGNED") return 2
  if (orderStatus === "PROCESSING") return 1
  return 0
}

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const order = await db.order.findUnique({
    where: { trackingToken: token },
    include: {
      store: { select: { name: true, slug: true, currency: true, whatsappNumber: true } },
      deliveryJob: true,
    },
  })
  if (!order || order.deliveryMethod !== "SHOPORA") notFound()

  const job = order.deliveryJob
  const step = activeStep(order.status, job?.status ?? null)
  const etaNote =
    job?.status === "DELIVERED"
      ? "Your order has been delivered."
      : "Accra Shopora Delivery is usually same day after the store confirms payment."

  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 py-16 text-stone-900">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{order.store.name}</p>
        <h1 className="mt-2 font-display text-4xl">Track your delivery</h1>
        <p className="mt-2 text-sm text-stone-600">Order {order.orderNumber}</p>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">{etaNote}</p>

        <ol className="mt-10 space-y-0">
          {STEPS.map((s, i) => {
            const done = i <= step
            const current = i === step
            return (
              <li key={s.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      done ? "bg-stone-900 text-white" : "border border-stone-300 text-stone-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className={`min-h-8 w-px flex-1 ${i < step ? "bg-stone-900" : "bg-stone-300"}`} />
                  )}
                </div>
                <div className={`pb-8 ${current ? "pt-1" : "pt-1.5"}`}>
                  <p className={`text-sm ${done ? "font-medium text-stone-900" : "text-stone-400"}`}>{s.label}</p>
                  {current && i === 1 && !job?.riderId && (
                    <p className="mt-1 text-xs text-stone-500">Waiting for a Shopora rider to accept.</p>
                  )}
                  {current && job?.status === "ASSIGNED" && (
                    <p className="mt-1 text-xs text-stone-500">A rider is heading to pick up your order.</p>
                  )}
                  {current && job?.status === "PICKED_UP" && (
                    <p className="mt-1 text-xs text-stone-500">Your order is on the way. Pay the rider the delivery fee on arrival.</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        <div className="border border-stone-200 bg-white p-5 text-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Delivering to</p>
          <p className="mt-2 text-stone-800">{order.shippingAddress}</p>
          {order.shippingAmount > 0 && (
            <p className="mt-4 text-stone-600">
              Delivery fee (pay rider on arrival):{" "}
              <strong className="text-stone-900">
                {order.store.currency} {order.shippingAmount.toFixed(2)}
              </strong>
            </p>
          )}
        </div>

        <Link href={`/storefront/${order.store.slug}`} className="mt-8 inline-block text-sm text-stone-600 underline">
          Back to store
        </Link>
      </div>
    </div>
  )
}
