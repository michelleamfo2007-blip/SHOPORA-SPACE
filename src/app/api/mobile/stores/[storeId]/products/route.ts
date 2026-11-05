import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { MAX_PRODUCT_IMAGES } from "@/lib/compress-image"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { getProductLimitMessage } from "@/lib/plan-limits"
import { buildVariantInputs, syncProductVariants } from "@/lib/product-variants"
import { optionCreateData, parseOptions, variantRows } from "@/lib/product-options"

/** Seller's products, newest first. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const products = await db.product.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      price: true,
      status: true,
      visibility: true,
      images: true,
      variants: { select: { price: true, stockCount: true } },
    },
  })

  return Response.json({
    currency: access.store.currency,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price ?? p.variants[0]?.price ?? null,
      stockCount: p.variants.reduce((sum, v) => sum + v.stockCount, 0),
      status: p.status,
      visibility: p.visibility,
      imageUrl: p.images[0] ?? null,
    })),
  })
}

/** Product from the phone: name, price, stock, description, up to 2 photos, optional sizes/colours. */
export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body.name || "").trim()
    const price = Number(body.price)
    const compareAtPrice = body.compareAtPrice ? Number(body.compareAtPrice) : null
    const stockCount = Math.max(0, Math.floor(Number(body.stockCount) || 0))
    const description = String(body.description || "").trim() || null
    const images: string[] = Array.isArray(body.images)
      ? body.images.filter((u: unknown): u is string => typeof u === "string" && u.length > 0).slice(0, MAX_PRODUCT_IMAGES)
      : []

    if (!name) return Response.json({ error: "Add a product name." }, { status: 400 })
    if (!Number.isFinite(price) || price <= 0) return Response.json({ error: "Add a selling price." }, { status: 400 })
    if (images.length === 0) return Response.json({ error: "Add at least one photo." }, { status: 400 })

    const parsed = parseOptions(body.options)
    if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const rows = parsed.options.length ? variantRows(parsed.options, body.variants, price) : []

    const limitMessage = await getProductLimitMessage(storeId)
    if (limitMessage) return Response.json({ error: limitMessage }, { status: 403 })

    const product = await db.product.create({
      data: {
        storeId,
        name,
        description,
        status: body.publish === false ? "DRAFT" : "ACTIVE",
        visibility: "VISIBLE",
        price,
        compareAtPrice: compareAtPrice && Number.isFinite(compareAtPrice) ? compareAtPrice : null,
        stockCount: rows.length ? rows.reduce((sum, r) => sum + r.stockCount, 0) : stockCount,
        images,
        options: { create: optionCreateData(parsed.options) },
      },
      include: { options: { include: { values: true } } },
    })

    await syncProductVariants(product.id, buildVariantInputs(product, rows))
    revalidatePath(`/${storeId}/products`)

    return Response.json({ success: true, product: { id: product.id, name: product.name } })
  } catch (err) {
    console.error("[MOBILE_PRODUCT_POST]", err)
    return Response.json({ error: "Could not save this product. Try again." }, { status: 500 })
  }
}
