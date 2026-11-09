import { mobileFeatureGate, requireMobileStoreAccess } from "@/lib/mobile-auth"
import { createTillSale, getTillProducts, getTillSummary } from "@/lib/pos"
import { TILL_PAYMENT_METHODS } from "@/lib/pos-receipt"

/** Till screen data: products to sell and today's takings. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "pos")
  if (locked) return locked

  const [items, summary] = await Promise.all([getTillProducts(storeId), getTillSummary(storeId)])
  return Response.json({ currency: access.store.currency, paymentMethods: TILL_PAYMENT_METHODS, items, summary })
}

/** Ring up a walk-in sale. */
export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "pos")
  if (locked) return locked

  const body = await req.json().catch(() => ({}))
  const result = await createTillSale(storeId, {
    items: Array.isArray(body.items) ? body.items : [],
    paymentMethod: String(body.paymentMethod ?? ""),
    amountTendered: body.amountTendered ?? null,
    customer: body.customer ?? null,
  })
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ ...result, summary: await getTillSummary(storeId) })
}
