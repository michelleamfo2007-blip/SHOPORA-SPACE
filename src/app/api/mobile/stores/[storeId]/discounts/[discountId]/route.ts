import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreManager } from "@/lib/mobile-auth"

type Params = { params: Promise<{ storeId: string; discountId: string }> }

/** Turn a promo code on or off. */
export async function PATCH(req: Request, { params }: Params) {
  const { storeId, discountId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await db.discount.updateMany({
    where: { id: discountId, storeId },
    data: { isActive: body.isActive === true },
  })
  if (result.count === 0) return Response.json({ error: "Discount not found." }, { status: 404 })

  revalidatePath(`/${storeId}/discounts`)
  return Response.json({ success: true })
}

export async function DELETE(req: Request, { params }: Params) {
  const { storeId, discountId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  await db.discount.deleteMany({ where: { id: discountId, storeId } })
  revalidatePath(`/${storeId}/discounts`)
  return Response.json({ success: true })
}
