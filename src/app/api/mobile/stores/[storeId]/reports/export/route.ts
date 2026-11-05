import { db } from "@/lib/db"
import { mobileFeatureGate, requireMobileStoreManager } from "@/lib/mobile-auth"
import { reportFileName, resolveReportRange, salesReportCsv } from "@/lib/sales-report"

/** CSV of every item sold in the range, for Excel / Google Sheets. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "reportExport")
  if (locked) return locked

  const search = new URL(req.url).searchParams
  const range = resolveReportRange({ range: search.get("range"), from: search.get("from"), to: search.get("to") })
  const store = await db.store.findUnique({ where: { id: storeId }, select: { slug: true } })
  const csv = await salesReportCsv(storeId, range.from, range.to)

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${reportFileName(store?.slug ?? "store", range.from, range.to)}"`,
    },
  })
}
