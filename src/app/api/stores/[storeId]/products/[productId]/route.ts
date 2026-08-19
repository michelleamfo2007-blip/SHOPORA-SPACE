import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { ProductStatus, ProductVisibility } from "@prisma/client"

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

    // Verify user is authorized for this store
    const storeMember = await db.storeMember.findUnique({
      where: {
        storeId_userId: {
          storeId,
          userId: session.user.id
        }
      }
    })

    if (!storeMember) {
      return new NextResponse("Unauthorized access to this store", { status: 403 })
    }

    // Update the main product fields
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
      }
    })

    // Currently we won't rebuild options and variants automatically on update 
    // unless we delete all and recreate, which is dangerous for stock.
    // For now, updating the product is supported. We can add variant updating logic later.

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
