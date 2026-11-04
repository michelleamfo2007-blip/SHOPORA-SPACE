import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { addManualReview } from "@/lib/review-service"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const reviews = await db.review.findMany({
    where: { storeId },
    select: {
      id: true,
      rating: true,
      comment: true,
      status: true,
      createdAt: true,
      product: { select: { id: true, name: true } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      hidden: r.status === "HIDDEN",
      createdAt: r.createdAt,
      productName: r.product.name,
      customerName: r.customer?.name || "Anonymous",
    })),
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await addManualReview(storeId, {
    customerName: String(body.customerName || ""),
    rating: Number(body.rating),
    comment: String(body.comment || ""),
    productId: body.productId ? String(body.productId) : undefined,
  })
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })

  revalidatePath(`/${storeId}/reviews`)
  return Response.json({ success: true })
}
