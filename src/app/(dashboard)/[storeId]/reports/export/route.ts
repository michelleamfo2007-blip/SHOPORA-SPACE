import { db } from "@/lib/db"
import { getStoreManagerAccess } from "@/lib/store-access"
import { featureGate } from "@/lib/store-plan"
import { reportFileName, resolveReportRange, salesReportCsv } from "@/lib/sales-report"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await getStoreManagerAccess(storeId)
  if ("error" in access) return new Response(access.error, { status: access.status })
  const locked = await featureGate(storeId, "reportExport")
  if (locked) return new Response(locked, { status: 403 })

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
