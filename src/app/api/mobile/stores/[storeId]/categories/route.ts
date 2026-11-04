import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { createCategory } from "@/lib/category-service"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const categories = await db.category.findMany({
    where: { storeId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  return Response.json({
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c._count.products })),
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await createCategory(storeId, String(body.name || ""))
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })

  revalidatePath(`/${storeId}/categories`)
  return Response.json({ success: true, category: { id: result.category.id, name: result.category.name } })
}
