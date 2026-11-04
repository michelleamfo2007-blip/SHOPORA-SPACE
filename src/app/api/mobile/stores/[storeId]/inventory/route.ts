import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"

/** Every variant's stock, like the web Inventory page. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const products = await db.product.findMany({
    where: { storeId },
    select: {
      id: true,
      name: true,
      isActive: true,
      images: true,
      variants: { select: { id: true, sku: true, stockCount: true, optionValues: { select: { value: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json({
    items: products.flatMap((p) =>
      p.variants.map((v) => ({
        variantId: v.id,
        productId: p.id,
        productName: p.name,
        variantName: v.optionValues.length ? v.optionValues.map((o) => o.value).join(" / ") : null,
        sku: v.sku,
        stockCount: v.stockCount,
        active: p.isActive,
        imageUrl: p.images[0] ?? null,
      }))
    ),
  })
}

/** Quick stock change for one variant. Simple products keep the product-level count in step. */
export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const variantId = String(body.variantId || "")
  const stockCount = Math.floor(Number(body.stockCount))
  if (!variantId || !Number.isFinite(stockCount) || stockCount < 0) {
    return Response.json({ error: "Enter a stock count of 0 or more." }, { status: 400 })
  }

  const variant = await db.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
    select: { id: true, productId: true, product: { select: { _count: { select: { options: true } } } } },
  })
  if (!variant) return Response.json({ error: "Item not found." }, { status: 404 })

  await db.productVariant.update({ where: { id: variant.id }, data: { stockCount } })
  if (variant.product._count.options === 0) {
    await db.product.update({ where: { id: variant.productId }, data: { stockCount } })
  }

  revalidatePath(`/${storeId}/inventory`)
  revalidatePath("/", "layout")
  return Response.json({ success: true })
}
