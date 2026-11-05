import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { createDiscount } from "@/lib/discount-service"
import { requireMobileStoreManager } from "@/lib/mobile-auth"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const discounts = await db.discount.findMany({
    where: { storeId },
    select: { id: true, code: true, type: true, value: true, isActive: true, usageLimit: true, timesUsed: true },
    orderBy: { startDate: "desc" },
  })
  return Response.json({ currency: access.store.currency, discounts })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const usageLimit = body.usageLimit ? Math.floor(Number(body.usageLimit)) : null
  const result = await createDiscount(storeId, {
    code: String(body.code || ""),
    type: String(body.type || ""),
    value: Number(body.value),
    usageLimit: usageLimit && usageLimit > 0 ? usageLimit : null,
  })
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })

  revalidatePath(`/${storeId}/discounts`)
  return Response.json({ success: true })
}
