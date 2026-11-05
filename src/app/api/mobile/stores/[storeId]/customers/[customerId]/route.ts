import { mobileFeatureGate, requireMobileStoreAccess } from "@/lib/mobile-auth"
import { updateCustomerNotes } from "@/lib/customer-notes"

/** Saves the seller's private notes and tags on a customer. */
export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string; customerId: string }> }) {
  const { storeId, customerId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "customerNotes")
  if (locked) return locked

  const body = await req.json().catch(() => ({}))
  const result = await updateCustomerNotes(storeId, customerId, body)
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json(result)
}
