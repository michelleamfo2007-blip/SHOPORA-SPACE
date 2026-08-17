import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"

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
    const { name, description, isActive, options, variants } = body

    if (!name || !variants || variants.length === 0) {
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
    const optionData = options.map((opt: any, index: number) => ({
      name: opt.name,
      position: index + 1,
      values: {
        create: opt.values.map((val: string) => ({ value: val }))
      }
    }))

    // Create the product first (without variants to easily link option values)
    const product = await db.product.create({
      data: {
        storeId,
        name,
        description,
        isActive,
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

    // Prepare variants payload, linking the right OptionValues based on the variant name
    // Variant names are "Value1 / Value2" matching the options
    const variantData = variants.map((v: any) => {
      const variantValues = v.name.split(" / ")
      const optionValueIds: { id: string }[] = []

      // Find the corresponding OptionValue IDs for this variant
      product.options.forEach((opt, optIndex) => {
        const valName = variantValues[optIndex]
        const matchedVal = opt.values.find(ov => ov.value === valName)
        if (matchedVal) {
          optionValueIds.push({ id: matchedVal.id })
        }
      })

      return {
        productId: product.id,
        name: v.name,
        price: v.price,
        sku: v.sku || null,
        stockCount: v.stockCount,
        optionValues: optionValueIds.length > 0 ? { connect: optionValueIds } : undefined
      }
    })

    // Create all variants
    for (const vData of variantData) {
      await db.productVariant.create({
        data: vData
      })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("[PRODUCT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
