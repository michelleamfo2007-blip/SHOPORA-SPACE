import { redirect } from "next/navigation"
import Link from "next/link"
import { requireRider } from "@/lib/rider-session"
import { getRiderEarningsSummary } from "@/lib/delivery-earnings"
import { riderLogoutAction } from "@/server/actions/rider"
import { RiderNav } from "../RiderNav"

function money(amount: number) {
  return `GHS ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function RiderEarningsPage() {
  const auth = await requireRider()
  if ("error" in auth) redirect("/rider/login")

  const summary = await getRiderEarningsSummary(auth.rider.id)

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Shopora riders · Accra</p>
            <h1 className="font-display text-2xl">Earnings</h1>
          </div>
          <form action={riderLogoutAction}>
            <button type="submit" className="text-sm text-stone-600 underline">
              Log out
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-3xl px-5">
          <RiderNav active="earnings" />
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl gap-8 px-5 py-8">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Total earnings", summary.total],
            ["Today", summary.today],
            ["This week", summary.week],
            ["This month", summary.month],
          ].map(([label, value]) => (
            <div key={label as string} className="border border-stone-200 bg-white p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
              <p className="mt-1 font-display text-3xl">{money(value as number)}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-stone-200 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Completed deliveries</p>
            <p className="mt-1 font-display text-3xl">{summary.completedCount}</p>
          </div>
          <div className="border border-stone-200 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Owed to Shopora</p>
            <p className="mt-1 font-display text-3xl">{money(summary.pendingShoporaCut)}</p>
            <p className="mt-2 text-xs text-stone-500">Platform cut from completed jobs, pending MoMo settlement.</p>
          </div>
        </div>

        <section>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl">Transaction history</h2>
            <Link href="/rider/history" className="text-sm text-stone-600 underline">
              Full history
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {summary.transactions.length === 0 && (
              <p className="border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                No completed deliveries yet.
              </p>
            )}
            {summary.transactions.map((job) => (
              <article key={job.id} className="border border-stone-200 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{job.order.store.name}</p>
                    <p className="text-xs text-stone-500">
                      {job.order.orderNumber}
                      {job.deliveredAt
                        ? ` · ${job.deliveredAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">{job.dropoffAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-800">+{money(job.riderPayout)}</p>
                    <p className="text-xs text-stone-500">Fee {money(job.feeAmount)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
