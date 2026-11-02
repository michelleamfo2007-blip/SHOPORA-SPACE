import { Suspense } from "react"
import { redirect } from "next/navigation"
import { requireRider } from "@/lib/rider-session"
import { getRiderDeliveryHistory } from "@/lib/delivery-earnings"
import { riderLogoutAction } from "@/server/actions/rider"
import { RiderNav } from "../RiderNav"
import { HistoryFilters } from "./HistoryFilters"

function money(amount: number) {
  return `GHS ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function RiderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const auth = await requireRider()
  if ("error" in auth) redirect("/rider/login")

  const sp = await searchParams
  const raw = (sp.status || "ALL").toUpperCase()
  const status =
    raw === "DELIVERED" || raw === "FAILED" || raw === "CANCELLED" ? raw : ("ALL" as const)

  const jobs = await getRiderDeliveryHistory(auth.rider.id, status)

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Shopora riders · Accra</p>
            <h1 className="font-display text-2xl">Delivery history</h1>
          </div>
          <form action={riderLogoutAction}>
            <button type="submit" className="text-sm text-stone-600 underline">
              Log out
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-3xl px-5">
          <RiderNav active="history" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        <Suspense fallback={<div className="h-9" />}>
          <HistoryFilters />
        </Suspense>

        <div className="grid gap-3">
          {jobs.length === 0 && (
            <p className="border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
              No deliveries in this filter yet.
            </p>
          )}
          {jobs.map((job) => (
            <article key={job.id} className="border border-stone-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{job.order.store.name}</p>
                  <p className="text-xs text-stone-500">
                    {job.order.orderNumber} · {job.status}
                    {job.deliveredAt
                      ? ` · ${job.deliveredAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`
                      : job.failedAt
                        ? ` · ${job.failedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`
                        : ` · ${job.updatedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {job.status === "DELIVERED" ? money(job.riderPayout) : money(job.feeAmount)}
                </p>
              </div>
              <p className="mt-3 text-sm text-stone-700">
                <span className="text-stone-500">Customer:</span> {job.order.customer.name}
              </p>
              <p className="mt-1 text-sm text-stone-700">
                <span className="text-stone-500">Dropoff:</span> {job.dropoffAddress}
              </p>
              {job.failedReason && (
                <p className="mt-2 text-xs text-red-700">
                  {job.failedReason}
                  {job.failedNotes ? ` — ${job.failedNotes}` : ""}
                </p>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
