import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { savePaymentDetails } from "@/lib/payment-settings"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const s = await db.storePaymentSetting.findUnique({ where: { storeId } })
  return Response.json({
    bankName: s?.bankName ?? "",
    accountName: s?.accountName ?? "",
    accountNumber: s?.accountNumber ?? "",
    mobileMoneyNumber: s?.mobileMoneyNumber ?? "",
    instructions: s?.instructions ?? "",
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await savePaymentDetails(storeId, {
    bankName: String(body.bankName || "").trim(),
    accountName: String(body.accountName || "").trim(),
    accountNumber: String(body.accountNumber || "").trim(),
    mobileMoneyNumber: String(body.mobileMoneyNumber || "").trim(),
    instructions: String(body.instructions || "").trim(),
  })
  if ("error" in result) return Response.json({ error: result.error }, { status: 500 })
  return Response.json({ success: true })
}
