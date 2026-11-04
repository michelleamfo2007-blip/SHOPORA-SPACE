import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { verifyOrderPayment } from "@/lib/order-service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  const { storeId, orderId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const result = await verifyOrderPayment(storeId, orderId)
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ success: true })
}
