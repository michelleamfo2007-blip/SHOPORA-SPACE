import Link from "next/link"
import { db } from "@/lib/db"

export default async function TrackLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const sp = await searchParams
  const email = (sp.email || "").trim().toLowerCase()

  const deliveries =
    email && email.includes("@")
      ? await db.order.findMany({
          where: {
            deliveryMethod: "SHOPORA",
            trackingToken: { not: null },
            customer: { email },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            shippingAddress: true,
            createdAt: true,
            trackingToken: true,
            store: { select: { name: true } },
            deliveryJob: { select: { status: true, feeAmount: true, deliveredAt: true, failedAt: true } },
          },
        })
      : []

  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 py-16 text-stone-900">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Shopora Delivery</p>
        <h1 className="mt-2 font-display text-4xl">Your deliveries</h1>
        <p className="mt-2 text-sm text-stone-600">
          Enter the email you used at checkout to see Accra Shopora Delivery history and track links.
        </p>

        <form className="mt-8 flex gap-2">
          <input
            type="email"
            name="email"
            required
            defaultValue={email}
            placeholder="you@email.com"
            className="h-12 flex-1 border border-stone-300 bg-white px-4 text-sm focus:border-stone-900 focus:outline-none"
          />
          <button type="submit" className="h-12 rounded-full bg-stone-900 px-5 text-sm font-medium text-white">
            Look up
          </button>
        </form>

        {email && (
          <div className="mt-8 grid gap-3">
            {deliveries.length === 0 ? (
              <p className="border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                No Shopora deliveries found for that email.
              </p>
            ) : (
              deliveries.map((order) => (
                <article key={order.id} className="border border-stone-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{order.store.name}</p>
                      <p className="text-xs text-stone-500">
                        {order.orderNumber} · {order.deliveryJob?.status || order.status}
                      </p>
                    </div>
                    {order.trackingToken && (
                      <Link href={`/track/${order.trackingToken}`} className="text-sm underline">
                        Track
                      </Link>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{order.shippingAddress}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {order.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
