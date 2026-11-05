import { requireMobileStoreManager } from "@/lib/mobile-auth"
import { REPORT_PRESETS, getSalesReport, resolveReportRange } from "@/lib/sales-report"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const search = new URL(req.url).searchParams
  const range = resolveReportRange({ range: search.get("range"), from: search.get("from"), to: search.get("to") })
  const report = await getSalesReport(storeId, range.from, range.to)

  return Response.json({
    currency: access.store.currency,
    presets: REPORT_PRESETS,
    range: { value: range.range, label: range.label, from: range.from, to: range.to },
    ...report,
  })
}
