import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
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

    // Process Option mapping
    const optionData = options?.map((opt: { name: string; values: string[] }, index: number) => ({
      name: opt.name,
      position: index + 1,
      values: {
        create: opt.values.map((val: string) => ({ value: val }))
      }
    })) || []

    // Delete existing options and variants to rebuild them clean
    await db.productOption.deleteMany({ where: { productId } })
    await db.productVariant.deleteMany({ where: { productId } })

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

    // If variants exist, create them
    if (variants && variants.length > 0) {
      const variantData = variants.map((v: { name: string; price: number; compareAtPrice?: number | null; sku?: string; stockCount: number; imageBase64?: string }) => {
        const variantValues = v.name.split(" / ")
        const optionValueIds: { id: string }[] = []

        product.options.forEach((opt: any, optIndex: number) => {
          const valName = variantValues[optIndex]
          const matchedVal = opt.values.find((ov: any) => ov.value === valName)
          if (matchedVal) {
            optionValueIds.push({ id: matchedVal.id })
          }
        })
        
        const generatedSku = `${name.substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`

        return {
          productId: product.id,
          name: v.name,
          price: v.price,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice as any) : null,
          sku: v.sku || generatedSku,
          stockCount: v.stockCount,
          imageUrl: v.imageBase64 || null,
          optionValues: optionValueIds.length > 0 ? { connect: optionValueIds } : undefined
        }
      })

      for (const vData of variantData) {
        await db.productVariant.create({
          data: vData
        })
      }
    }

    revalidatePath('/', 'layout') // Invalidate all cached pages to ensure storefront updates

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
