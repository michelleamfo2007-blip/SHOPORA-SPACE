import { db } from "@/lib/db"
import { CreateRiderForm } from "./CreateRiderForm"
import { RiderStatusButton } from "./RiderStatusButton"
import { ResetRiderPasswordForm } from "./ResetRiderPasswordForm"

export default async function SuperAdminRidersPage() {
  const riders = await db.rider.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { jobs: true } },
    },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Riders</h1>
        <p className="mt-1 text-slate-500">
          Riders can self-signup at /rider/signup (starts as PENDING). Activate them here. Reset passwords when they forget login.
        </p>
      </div>

      <CreateRiderForm />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Rider</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Owed</th>
              <th className="px-4 py-3 font-medium">Jobs</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {riders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No riders yet. Create one above.
                </td>
              </tr>
            )}
            {riders.map((rider) => (
              <tr key={rider.id} className="border-b border-slate-100 last:border-0 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{rider.name}</p>
                  {rider.email && <p className="text-xs text-slate-500">{rider.email}</p>}
                  <p className="mt-1 text-xs text-slate-500">{rider.type}</p>
                  <ResetRiderPasswordForm riderId={rider.id} riderName={rider.name} />
                </td>
                <td className="px-4 py-3 text-slate-600">{rider.phone}</td>
                <td className="px-4 py-3 text-slate-600">
                  {rider.ratingCount > 0 ? (
                    <>
                      {rider.ratingAvg.toFixed(1)}★
                      <span className="text-xs text-slate-400"> ({rider.ratingCount})</span>
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">GHS {rider.walletOwed.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{rider._count.jobs}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        rider.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800"
                          : rider.status === "PENDING"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {rider.status}
                    </span>
                    {rider.status === "ACTIVE" ? (
                      <RiderStatusButton riderId={rider.id} status="SUSPENDED" label="Suspend" />
                    ) : (
                      <RiderStatusButton riderId={rider.id} status="ACTIVE" label="Activate" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
