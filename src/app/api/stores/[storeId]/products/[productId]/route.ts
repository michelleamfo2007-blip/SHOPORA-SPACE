import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { ProductStatus, ProductVisibility } from "@prisma/client"
import { getStoreAccess } from "@/lib/store-access"
import { buildVariantInputs, syncProductVariants } from "@/lib/product-variants"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { storeId, productId } = await params;
    const body = await req.json()
    const { 
      name, description, status, visibility,
      price, compareAtPrice, sku, stockCount, lowStockThreshold,
      images, sizeGuideUrl, videoUrl,
      seoTitle, seoDescription,
      options, variants 
    } = body

    if (!name) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const access = await getStoreAccess(storeId)
    if ("error" in access) {
      return new NextResponse(access.error, { status: access.status })
    }

    const existingProduct = await db.product.findFirst({ where: { id: productId, storeId } })
    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 })
    }

    // Process Option mapping
    const optionData = options?.map((opt: { name: string; values: string[] }, index: number) => ({
      name: opt.name,
      position: index + 1,
      values: {
        create: opt.values.map((val: string) => ({ value: val }))
      }
    })) || []

    // Options are rebuilt from scratch; variants are synced by name below so ordered ones survive
    await db.productOption.deleteMany({ where: { productId } })

    // Update the main product fields and create new options
    const product = await db.product.update({
      where: { id: productId, storeId },
      data: {
        name,
        description,
        status: status as ProductStatus,
        visibility: visibility as ProductVisibility,
        price,
        compareAtPrice,
        sku,
        stockCount,
        lowStockThreshold,
        images,
        sizeGuideUrl,
        videoUrl,
        seoTitle,
        seoDescription,
        options: {
          create: optionData
        }
      },
      include: {
        options: {
          include: { values: true }
        }
      }
    })

    await syncProductVariants(product.id, buildVariantInputs(product, variants))

    revalidatePath('/', 'layout') // Invalidate all cached pages to ensure storefront updates

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
