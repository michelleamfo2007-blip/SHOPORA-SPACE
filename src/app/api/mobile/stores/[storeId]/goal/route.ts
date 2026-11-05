import { mobileFeatureGate, requireMobileStoreManager } from "@/lib/mobile-auth"
import { getMonthlyGoal, setMonthlyGoal } from "@/lib/sales-goal"

export async function PUT(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  const locked = await mobileFeatureGate(storeId, "monthlyGoal")
  if (locked) return locked

  const body = await req.json().catch(() => ({}))
  const result = await setMonthlyGoal(storeId, body.goal ?? null)
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ goal: await getMonthlyGoal(storeId) })
}
