import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { MAX_PRODUCT_IMAGES } from "@/lib/compress-image"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { buildVariantInputs, DEFAULT_VARIANT_NAME, syncProductVariants } from "@/lib/product-variants"

const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"] as const
const VISIBILITIES = ["VISIBLE", "HIDDEN"] as const

async function loadProduct(storeId: string, productId: string) {
  return db.product.findFirst({
    where: { id: productId, storeId },
    include: {
      options: { include: { values: true }, orderBy: { position: "asc" } },
      variants: { select: { id: true, name: true, price: true, stockCount: true, sku: true } },
    },
  })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  const { storeId, productId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const product = await loadProduct(storeId, productId)
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 })

  const hasOptions = product.options.length > 0
  return Response.json({
    currency: access.store.currency,
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stockCount: product.stockCount,
      status: product.status,
      visibility: product.visibility,
      images: product.images,
      options: product.options.map((o) => ({ name: o.name, values: o.values.map((v) => v.value) })),
      variants: hasOptions
        ? product.variants.filter((v) => v.name !== DEFAULT_VARIANT_NAME)
        : [],
    },
  })
}

/** Edit from the phone. Option structure (sizes/colours) is still edited on the web. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  const { storeId, productId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const existing = await loadProduct(storeId, productId)
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 })

  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body.name ?? existing.name).trim()
    const price = Number(body.price ?? existing.price)
    const compareAtPrice =
      body.compareAtPrice === null || body.compareAtPrice === "" ? null : Number(body.compareAtPrice ?? existing.compareAtPrice)
    const stockCount = Math.max(0, Math.floor(Number(body.stockCount ?? existing.stockCount) || 0))
    const status = STATUSES.includes(body.status) ? body.status : existing.status
    const visibility = VISIBILITIES.includes(body.visibility) ? body.visibility : existing.visibility
    const images: string[] = Array.isArray(body.images)
      ? body.images.filter((u: unknown): u is string => typeof u === "string" && u.length > 0).slice(0, MAX_PRODUCT_IMAGES)
      : existing.images

    if (!name) return Response.json({ error: "Add a product name." }, { status: 400 })
    if (!Number.isFinite(price) || price <= 0) return Response.json({ error: "Add a selling price." }, { status: 400 })

    const product = await db.product.update({
      where: { id: productId },
      data: {
        name,
        description: body.description === undefined ? existing.description : String(body.description).trim() || null,
        price,
        compareAtPrice: compareAtPrice != null && Number.isFinite(compareAtPrice) ? compareAtPrice : null,
        stockCount,
        status,
        isActive: status === "ACTIVE",
        visibility,
        images,
      },
      include: { options: { include: { values: true } } },
    })

    if (existing.options.length === 0) {
      // Simple product: keep its single default variant in step, same as the web form.
      await syncProductVariants(product.id, buildVariantInputs(product, []))
    } else if (Array.isArray(body.variants)) {
      const allowed = new Set(existing.variants.map((v) => v.id))
      for (const v of body.variants as { id: string; price: unknown; stockCount: unknown }[]) {
        if (!allowed.has(v.id)) continue
        const vPrice = Number(v.price)
        const vStock = Math.max(0, Math.floor(Number(v.stockCount) || 0))
        await db.productVariant.update({
          where: { id: v.id },
          data: { ...(Number.isFinite(vPrice) && vPrice > 0 ? { price: vPrice } : {}), stockCount: vStock },
        })
      }
    }

    revalidatePath("/", "layout")
    return Response.json({ success: true })
  } catch (err) {
    console.error("[MOBILE_PRODUCT_PATCH]", err)
    return Response.json({ error: "Could not save changes. Try again." }, { status: 500 })
  }
}
