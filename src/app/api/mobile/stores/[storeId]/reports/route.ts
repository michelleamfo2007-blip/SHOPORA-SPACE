import { mobileFeatureGate, requireMobileStoreManager } from "@/lib/mobile-auth"
import { REPORT_PRESETS, getSalesReport, resolveReportRange, withoutProfit } from "@/lib/sales-report"
import { getStorePlan } from "@/lib/store-plan"
import { planIncludes } from "@/lib/plan-features"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "salesReports")
  if (locked) return locked

  const plan = await getStorePlan(storeId)
  const showProfit = planIncludes(plan.name, "profit")
  const search = new URL(req.url).searchParams
  const range = resolveReportRange({ range: search.get("range"), from: search.get("from"), to: search.get("to") })
  const report = await getSalesReport(storeId, range.from, range.to)

  return Response.json({
    currency: access.store.currency,
    presets: REPORT_PRESETS,
    range: { value: range.range, label: range.label, from: range.from, to: range.to },
    showProfit,
    canExport: planIncludes(plan.name, "reportExport"),
    ...(showProfit ? report : withoutProfit(report)),
  })
}
