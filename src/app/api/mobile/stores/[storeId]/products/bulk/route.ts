import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { applyBulkUpdates, getBulkRows } from "@/lib/bulk-products"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  return Response.json({ currency: access.store.currency, rows: await getBulkRows(storeId) })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await applyBulkUpdates(storeId, Array.isArray(body.updates) ? body.updates : [])
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json(result)
}
