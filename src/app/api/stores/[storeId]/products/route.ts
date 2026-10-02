import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { ProductStatus, ProductVisibility } from "@prisma/client"
import { getProductLimitMessage } from "@/lib/plan-limits"
import { getStoreAccess } from "@/lib/store-access"
import { buildVariantInputs, syncProductVariants } from "@/lib/product-variants"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { storeId } = await params;
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

    const limitMessage = await getProductLimitMessage(storeId)
    if (limitMessage) {
      return new NextResponse(limitMessage, { status: 403 })
    }

    // Process Option mapping
    const optionData = options?.map((opt: { name: string; values: string[] }, index: number) => ({
      name: opt.name,
      position: index + 1,
      values: {
        create: opt.values.map((val: string) => ({ value: val }))
      }
    })) || []

    // Create the product
    const product = await db.product.create({
      data: {
        storeId,
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

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("[PRODUCT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
