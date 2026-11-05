import { mobileFeatureGate, requireMobileStoreAccess } from "@/lib/mobile-auth"
import { MANUAL_ORDER_SOURCES, createManualOrder, listSellableVariants } from "@/lib/manual-order"

/** Products to pick from when recording a WhatsApp / Instagram / walk-in order. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "manualOrders")
  if (locked) return locked

  return Response.json({
    currency: access.store.currency,
    sources: MANUAL_ORDER_SOURCES,
    items: await listSellableVariants(storeId),
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "manualOrders")
  if (locked) return locked

  const body = await req.json().catch(() => ({}))
  const result = await createManualOrder(storeId, {
    items: Array.isArray(body.items) ? body.items : [],
    customer: body.customer ?? {},
    source: String(body.source ?? "OTHER"),
    paid: body.paid === true,
    deliveryAddress: body.deliveryAddress ?? null,
    deliveryFee: body.deliveryFee ?? null,
    notes: body.notes ?? null,
  })
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json(result)
}
