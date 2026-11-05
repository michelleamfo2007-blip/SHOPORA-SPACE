import Link from "next/link"
import { Download } from "lucide-react"
import { db } from "@/lib/db"
import { requireStoreManagerPage } from "@/lib/store-access"
import { REPORT_PRESETS, getSalesReport, resolveReportRange } from "@/lib/sales-report"

function money(currency: string, n: number) {
  return `${currency} ${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string }>
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const { storeId } = await params
  await requireStoreManagerPage(storeId)
  const query = await searchParams
  const range = resolveReportRange(query)

  const [store, report] = await Promise.all([
    db.store.findUnique({ where: { id: storeId }, select: { currency: true } }),
    getSalesReport(storeId, range.from, range.to),
  ])
  const currency = store?.currency ?? "GHS"
  const { totals } = report
  const maxDay = Math.max(1, ...report.byDay.map((d) => d.revenue))
  const exportQuery = new URLSearchParams(
    range.range === "custom" ? { from: query.from ?? "", to: query.to ?? "" } : { range: range.range }
  ).toString()
  const lastDay = new Date(range.to.getTime() - 86400000).toISOString().slice(0, 10)

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Sales reports</h1>
          <p className="mt-1 text-stone-500">{range.label} · paid orders only</p>
        </div>
        <a
          href={`/${storeId}/reports/export?${exportQuery}`}
          className="inline-flex h-10 items-center gap-2 self-start rounded-full bg-stone-950 px-5 text-sm font-medium text-white hover:bg-stone-800"
        >
          <Download className="h-4 w-4" /> Download for Excel (CSV)
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {REPORT_PRESETS.map((p) => (
          <Link
            key={p.value}
            href={`/${storeId}/reports?range=${p.value}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              range.range === p.value ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
            }`}
          >
            {p.label}
          </Link>
        ))}
        <form className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
          <input type="date" name="from" defaultValue={range.from.toISOString().slice(0, 10)} className="h-9 rounded-lg border border-stone-200 bg-white px-2" />
          to
          <input type="date" name="to" defaultValue={lastDay} className="h-9 rounded-lg border border-stone-200 bg-white px-2" />
          <button className="h-9 rounded-lg border border-stone-300 bg-white px-3 font-medium text-stone-900 hover:bg-stone-50">Apply</button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Sales", value: money(currency, totals.revenue), hint: `${totals.orders} paid orders` },
          {
            label: "Profit",
            value: money(currency, totals.profit),
            hint: totals.margin != null ? `${Math.round(totals.margin * 100)}% margin` : "Add cost prices to see profit",
          },
          { label: "Average order", value: money(currency, totals.averageOrder), hint: "per paid order" },
          { label: "Waiting for payment", value: money(currency, totals.pendingAmount), hint: `${totals.pendingOrders} orders` },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{card.value}</p>
            <p className="mt-1 text-xs text-stone-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {totals.productsMissingCost > 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {totals.productsMissingCost} product{totals.productsMissingCost === 1 ? "" : "s"} sold in this period {totals.productsMissingCost === 1 ? "has" : "have"} no cost price, so {totals.productsMissingCost === 1 ? "it isn't" : "they aren't"} counted in profit.{" "}
          <Link href={`/${storeId}/products/bulk`} className="font-semibold underline">
            Add cost prices
          </Link>
        </p>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-950">Sales by day</h2>
        <div className="mt-4 flex h-40 items-end gap-[2px]">
          {report.byDay.map((d) => (
            <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${d.date}: ${money(currency, d.revenue)}`}>
              <div className="w-full rounded-t-sm bg-stone-900" style={{ height: `${Math.max(d.revenue > 0 ? 3 : 1, (d.revenue / maxDay) * 100)}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-stone-400">
          <span>{report.byDay[0]?.date}</span>
          <span>{report.byDay[report.byDay.length - 1]?.date}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-950">Where sales came from</h2>
          {report.bySource.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">No paid orders in this period.</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-100">
              {report.bySource.map((s) => (
                <li key={s.source} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-stone-700">{s.label}</span>
                  <span className="text-stone-500">
                    {s.orders} · <span className="font-medium text-stone-950">{money(currency, s.revenue)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-950">Top products</h2>
          {report.topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">No paid orders in this period.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                <tr>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 text-right font-medium">Sold</th>
                  <th className="pb-2 text-right font-medium">Sales</th>
                  <th className="pb-2 text-right font-medium">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {report.topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="py-2.5 pr-2 text-stone-800">{p.name}</td>
                    <td className="py-2.5 text-right text-stone-600">{p.quantity}</td>
                    <td className="py-2.5 text-right text-stone-900">{money(currency, p.revenue)}</td>
                    <td className="py-2.5 text-right text-stone-600">{p.profit == null ? "—" : money(currency, p.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
