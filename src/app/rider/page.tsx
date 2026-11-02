import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireRider } from "@/lib/rider-session"
import { riderLogoutAction } from "@/server/actions/rider"
import { RiderJobActions } from "./RiderJobActions"
import { RiderAvailabilityToggle } from "./RiderAvailabilityToggle"
import { RiderNav } from "./RiderNav"

function money(amount: number) {
  return `GHS ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function RiderDashboardPage() {
  const auth = await requireRider()
  if ("error" in auth) redirect("/rider/login")
  const { rider } = auth

  const [openJobs, myJobs] = await Promise.all([
    rider.isOnline
      ? db.deliveryJob.findMany({
          where: {
            status: "PENDING",
            riderId: null,
            order: { status: "PROCESSING", deliveryMethod: "SHOPORA" },
          },
          include: {
            order: {
              select: {
                orderNumber: true,
                shippingAmount: true,
                store: { select: { name: true, currency: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    db.deliveryJob.findMany({
      where: {
        riderId: rider.id,
        status: { in: ["ASSIGNED", "PICKED_UP"] },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            shippingAmount: true,
            customer: { select: { name: true, phone: true } },
            store: { select: { name: true, currency: true } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    }),
  ])

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Shopora riders · Accra</p>
            <h1 className="font-display text-2xl">{rider.name}</h1>
          </div>
          <form action={riderLogoutAction}>
            <button type="submit" className="text-sm text-stone-600 underline">
              Log out
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-3xl px-5">
          <RiderNav active="jobs" />
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl gap-10 px-5 py-8">
        <RiderAvailabilityToggle isOnline={rider.isOnline} />

        <section className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Wallet owed to Shopora</p>
          <p className="mt-1 font-display text-3xl">{money(rider.walletOwed)}</p>
          <p className="mt-2 text-xs text-stone-500">Settle this to Shopora’s MoMo weekly.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl">Open jobs</h2>
          <p className="mt-1 text-sm text-stone-600">
            First online rider to accept gets the job. Others cannot take it after that.
          </p>
          <div className="mt-4 grid gap-4">
            {!rider.isOnline && (
              <p className="border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                You are offline. Go online to see and accept Accra jobs.
              </p>
            )}
            {rider.isOnline && openJobs.length === 0 && (
              <p className="border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                No open Accra jobs right now. New ones appear when a store confirms payment.
              </p>
            )}
            {openJobs.map((job) => (
              <article key={job.id} className="border border-stone-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{job.order.store.name}</p>
                    <p className="text-xs text-stone-500">{job.order.orderNumber}</p>
                  </div>
                  <p className="text-sm font-medium">{money(job.feeAmount)}</p>
                </div>
                <p className="mt-3 text-sm text-stone-700">
                  <span className="text-stone-500">Pickup:</span> {job.pickupAddress}
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  <span className="text-stone-500">Dropoff:</span> {job.dropoffAddress}
                </p>
                {(job.distanceKm != null || job.durationMin != null) && (
                  <p className="mt-2 text-xs text-stone-500">
                    {job.distanceKm != null && `${job.distanceKm} km`}
                    {job.distanceKm != null && job.durationMin != null && " · "}
                    {job.durationMin != null && `~${Math.round(job.durationMin)} mins`}
                    {" · "}You keep {money(job.riderPayout)}
                  </p>
                )}
                <RiderJobActions jobId={job.id} status="PENDING" />
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">My active deliveries</h2>
          <div className="mt-4 grid gap-4">
            {myJobs.length === 0 && (
              <p className="border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                No active deliveries. Accept an open job above.
              </p>
            )}
            {myJobs.map((job) => (
              <article key={job.id} className="border border-stone-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{job.order.store.name}</p>
                    <p className="text-xs text-stone-500">
                      {job.order.orderNumber} · {job.status === "ASSIGNED" ? "Go pick up" : "On the way — ask for OTP"}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{money(job.feeAmount)} on arrival</p>
                </div>
                <p className="mt-3 text-sm text-stone-700">
                  <span className="text-stone-500">Pickup:</span> {job.pickupAddress}
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  <span className="text-stone-500">Customer:</span> {job.order.customer.name}
                  {job.order.customer.phone ? ` · ${job.order.customer.phone}` : ""}
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  <span className="text-stone-500">Dropoff:</span> {job.dropoffAddress}
                </p>
                <RiderJobActions jobId={job.id} status={job.status} />
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
