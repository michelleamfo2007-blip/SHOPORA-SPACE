import Link from "next/link"
import { db } from "@/lib/db"
import { SettleRiderForm } from "./SettleRiderForm"
import { AdminJobActions } from "./AdminJobActions"

function money(n: number) {
  return `GHS ${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function SuperAdminDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const sp = await searchParams
  const statusFilter = sp.status?.toUpperCase() || ""
  const q = (sp.q || "").trim()

  const [riders, jobs, ridersOwing] = await Promise.all([
    db.rider.findMany({
      select: { id: true, status: true, isOnline: true },
    }),
    db.deliveryJob.findMany({
      where: {
        ...(statusFilter && ["PENDING", "ASSIGNED", "PICKED_UP", "DELIVERED", "FAILED", "CANCELLED"].includes(statusFilter)
          ? { status: statusFilter as any }
          : {}),
        ...(q
          ? {
              OR: [
                { order: { orderNumber: { contains: q, mode: "insensitive" } } },
                { order: { store: { name: { contains: q, mode: "insensitive" } } } },
                { dropoffAddress: { contains: q, mode: "insensitive" } },
                { rider: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        rider: { select: { id: true, name: true, phone: true, isOnline: true } },
        order: {
          select: {
            orderNumber: true,
            status: true,
            trackingToken: true,
            store: { select: { name: true } },
            customer: { select: { name: true, phone: true } },
          },
        },
        auditLogs: { orderBy: { createdAt: "desc" }, take: 3 },
      },
    }),
    db.rider.findMany({
      where: { walletOwed: { gt: 0 } },
      orderBy: { walletOwed: "desc" },
      select: { id: true, name: true, phone: true, email: true, walletOwed: true },
    }),
  ])

  const counts = {
    riders: riders.length,
    online: riders.filter((r) => r.status === "ACTIVE" && r.isOnline).length,
    offline: riders.filter((r) => r.status === "ACTIVE" && !r.isOnline).length,
    pending: jobs.filter((j) => j.status === "PENDING").length,
    assigned: jobs.filter((j) => j.status === "ASSIGNED").length,
    inProgress: jobs.filter((j) => j.status === "PICKED_UP").length,
    completed: jobs.filter((j) => j.status === "DELIVERED").length,
    failed: jobs.filter((j) => j.status === "FAILED").length,
    cancelled: jobs.filter((j) => j.status === "CANCELLED").length,
  }

  const filters = ["", "PENDING", "ASSIGNED", "PICKED_UP", "DELIVERED", "FAILED", "CANCELLED"]

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Deliveries</h1>
        <p className="mt-1 text-slate-500">
          Accra Shopora Delivery ops — open jobs, OTP handoff, failures, reopen, and rider settlements.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ["Riders", counts.riders],
          ["Online", counts.online],
          ["Offline", counts.offline],
          ["Open", counts.pending],
          ["Accepted", counts.assigned],
          ["In progress", counts.inProgress],
          ["Completed", counts.completed],
          ["Failed", counts.failed],
          ["Cancelled", counts.cancelled],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order, store, rider, address"
          className="h-10 min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f || "all"}
              href={`/super-admin/deliveries?${new URLSearchParams({
                ...(f ? { status: f } : {}),
                ...(q ? { q } : {}),
              }).toString()}`}
              className={`inline-flex h-10 items-center rounded-full px-4 text-xs font-medium ${
                statusFilter === f ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-700"
              }`}
            >
              {f || "All"}
            </Link>
          ))}
        </div>
        <button type="submit" className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white">
          Search
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Jobs</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Rider</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Track</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No jobs match this filter.
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{job.order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{job.order.store.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{job.dropoffAddress}</p>
                    {job.failedReason && (
                      <p className="mt-1 text-xs text-red-700">
                        Failed: {job.failedReason}
                        {job.failedNotes ? ` — ${job.failedNotes}` : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{job.status}</p>
                    <p className="text-xs text-slate-500">Order: {job.order.status}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {job.rider ? (
                      <>
                        <p>{job.rider.name}</p>
                        <p className="text-xs">
                          {job.rider.phone}
                          {job.rider.isOnline ? " · online" : " · offline"}
                        </p>
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
                  <td className="px-4 py-3">
                    <AdminJobActions jobId={job.id} status={job.status} />
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
          When a rider MoMos Shopora their platform cut, record it here.
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
