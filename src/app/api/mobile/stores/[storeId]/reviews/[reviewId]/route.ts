import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"

type Params = { params: Promise<{ storeId: string; reviewId: string }> }

/** Hide or show a review on the storefront. */
export async function PATCH(req: Request, { params }: Params) {
  const { storeId, reviewId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await db.review.updateMany({
    where: { id: reviewId, storeId },
    data: { status: body.hidden === true ? "HIDDEN" : "PUBLISHED" },
  })
  if (result.count === 0) return Response.json({ error: "Review not found." }, { status: 404 })

  revalidatePath(`/${storeId}/reviews`)
  return Response.json({ success: true })
}

export async function DELETE(req: Request, { params }: Params) {
  const { storeId, reviewId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  await db.review.deleteMany({ where: { id: reviewId, storeId } })
  revalidatePath(`/${storeId}/reviews`)
  return Response.json({ success: true })
}
