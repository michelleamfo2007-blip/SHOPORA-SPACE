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
  if (jobStatus === "FAILED" || jobStatus === "CANCELLED") return -1
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
      deliveryJob: {
        select: {
          status: true,
          feeAmount: true,
          deliveryOtpCode: true,
          deliveryOtpExpiresAt: true,
          failedReason: true,
          failedNotes: true,
        },
      },
    },
  })
  if (!order || order.deliveryMethod !== "SHOPORA") notFound()

  const job = order.deliveryJob
  const step = activeStep(order.status, job?.status ?? null)
  const showOtp =
    job?.status === "PICKED_UP" &&
    job.deliveryOtpCode &&
    (!job.deliveryOtpExpiresAt || job.deliveryOtpExpiresAt > new Date())

  const etaNote =
    job?.status === "DELIVERED"
      ? "Your order has been delivered."
      : job?.status === "FAILED"
        ? "The rider could not complete this delivery. The store and Shopora have been notified."
        : job?.status === "CANCELLED"
          ? "This Shopora delivery was cancelled."
          : "Accra Shopora Delivery is usually same day after the store confirms payment."

  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 py-16 text-stone-900">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{order.store.name}</p>
        <h1 className="mt-2 font-display text-4xl">Track your delivery</h1>
        <p className="mt-2 text-sm text-stone-600">Order {order.orderNumber}</p>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">{etaNote}</p>

        {job?.status === "FAILED" && (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
            <p className="font-medium">Delivery failed</p>
            {job.failedNotes && <p className="mt-1">{job.failedNotes}</p>}
          </div>
        )}

        {showOtp && (
          <div className="mt-6 border border-stone-900 bg-white px-5 py-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Give this code to the rider</p>
            <p className="mt-3 font-display text-4xl tracking-[0.35em]">{job.deliveryOtpCode}</p>
            <p className="mt-3 text-xs text-stone-500">Only share it when the rider is at your door with your order.</p>
          </div>
        )}

        {step >= 0 && (
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
                  <div className="pb-8 pt-1.5">
                    <p className={`text-sm ${done ? "font-medium text-stone-900" : "text-stone-400"}`}>{s.label}</p>
                    {current && i === 1 && (job?.status === "PENDING" || !job) && (
                      <p className="mt-1 text-xs text-stone-500">Waiting for a Shopora rider to accept.</p>
                    )}
                    {current && job?.status === "ASSIGNED" && (
                      <p className="mt-1 text-xs text-stone-500">A rider is heading to pick up your order.</p>
                    )}
                    {current && job?.status === "PICKED_UP" && (
                      <p className="mt-1 text-xs text-stone-500">
                        On the way. Pay the rider the delivery fee and give them your code on arrival.
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}

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

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-stone-600">
          <Link href={`/storefront/${order.store.slug}`} className="underline">
            Back to store
          </Link>
          <Link href="/track" className="underline">
            All my deliveries
          </Link>
        </div>
      </div>
    </div>
  )
}
