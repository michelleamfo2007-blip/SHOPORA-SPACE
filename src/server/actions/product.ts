"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation"

export async function createProductAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const storeId = formData.get("storeId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  
  // New fields
  const compareAtPriceStr = formData.get("compareAtPrice") as string
  const compareAtPrice = compareAtPriceStr ? parseFloat(compareAtPriceStr) : null
  const providedSku = formData.get("sku") as string
  const stockCount = parseInt(formData.get("stockCount") as string)
  const isActive = formData.get("isActive") === "on"
  const colorsStr = formData.get("colors") as string
  const imageBase64 = formData.get("imageBase64") as string

  if (!storeId || !name || isNaN(price)) {
    throw new Error("Missing required fields")
  }

  // Auto Generate SKU if not provided
  const sku = providedSku || `${name.substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`

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
    throw new Error("Unauthorized access to this store")
  }

  // Parse colors if any
  const colors = colorsStr ? colorsStr.split(',').map(c => c.trim()).filter(Boolean) : []

  if (colors.length > 0) {
    // Create Product with Color Option and Variants
    await db.product.create({
      data: {
        storeId,
        name,
        description,
        isActive,
        options: {
          create: {
            name: "Color",
            values: {
              create: colors.map(color => ({ value: color }))
            }
          }
        },
        variants: {
          create: colors.map((color, index) => ({
            name: color,
            price,
            compareAtPrice,
            sku: `${sku}-${color.substring(0,3).toUpperCase()}`,
            stockCount: isNaN(stockCount) ? 0 : stockCount,
            imageUrl: imageBase64 || null,
          }))
        }
      }
    })
  } else {
    // Create product with a single default variant
    await db.product.create({
      data: {
        storeId,
        name,
        description,
        isActive,
        variants: {
          create: {
            name: "Default",
            price,
            compareAtPrice,
            sku,
            stockCount: isNaN(stockCount) ? 0 : stockCount,
            imageUrl: imageBase64 || null,
          }
        }
      }
    })
  }

  redirect(`/${storeId}/products`)
}

