import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { updateOrderStatus } from "@/lib/order-service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  const { storeId, orderId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await updateOrderStatus(storeId, orderId, String(body.status || ""))
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ success: true })
}
