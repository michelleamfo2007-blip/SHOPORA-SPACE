import Link from "next/link"
import { db } from "@/lib/db"
import { SettleRiderForm } from "./SettleRiderForm"

function money(n: number) {
  return `GHS ${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function SuperAdminDeliveriesPage() {
  const [jobs, ridersOwing] = await Promise.all([
    db.deliveryJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        rider: { select: { id: true, name: true, phone: true } },
        order: {
          select: {
            orderNumber: true,
            status: true,
            trackingToken: true,
            store: { select: { name: true } },
            customer: { select: { name: true, phone: true } },
          },
        },
      },
    }),
    db.rider.findMany({
      where: { walletOwed: { gt: 0 } },
      orderBy: { walletOwed: "desc" },
      select: { id: true, name: true, phone: true, email: true, walletOwed: true },
    }),
  ])

  const open = jobs.filter((j) => j.status === "PENDING" && !j.riderId)
  const active = jobs.filter((j) => j.status === "ASSIGNED" || j.status === "PICKED_UP")

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Deliveries</h1>
        <p className="mt-1 text-slate-500">
          Accra Shopora Delivery jobs. Open jobs are emailed to riders when a store confirms payment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open</p>
          <p className="mt-1 text-3xl font-bold">{open.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">In progress</p>
          <p className="mt-1 text-3xl font-bold">{active.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Riders owing Shopora</p>
          <p className="mt-1 text-3xl font-bold">{ridersOwing.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Recent jobs</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Rider</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Track</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No Shopora delivery jobs yet.
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{job.order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{job.order.store.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{job.dropoffAddress}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{job.status}</p>
                    <p className="text-xs text-slate-500">Order: {job.order.status}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {job.rider ? (
                      <>
                        <p>{job.rider.name}</p>
                        <p className="text-xs">{job.rider.phone}</p>
                      </>
                    ) : (
                      <span className="text-amber-700">Waiting for accept</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p>{money(job.feeAmount)}</p>
                    <p className="text-xs text-slate-500">Cut {money(job.shoporaCut)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {job.order.trackingToken ? (
                      <Link href={`/track/${job.order.trackingToken}`} className="text-xs underline" target="_blank">
                        Open
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Settlements</h2>
        <p className="text-sm text-slate-500">
          When a rider MoMos Shopora their platform cut, record it here. That lowers what they owe.
        </p>
        {ridersOwing.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No riders currently owe Shopora.
          </p>
        ) : (
          <div className="grid gap-4">
            {ridersOwing.map((rider) => (
              <div key={rider.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{rider.name}</p>
                    <p className="text-sm text-slate-500">
                      {rider.phone}
                      {rider.email ? ` · ${rider.email}` : ""}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">Owes {money(rider.walletOwed)}</p>
                </div>
                <SettleRiderForm riderId={rider.id} maxAmount={rider.walletOwed} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
