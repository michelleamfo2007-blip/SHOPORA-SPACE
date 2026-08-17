"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createCategoryAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const storeId = formData.get("storeId") as string
  const name = formData.get("name") as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

  if (!storeId || !name) throw new Error("Missing required fields")

  const storeMember = await db.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId: session.user.id } }
  })
  if (!storeMember) throw new Error("Unauthorized access")

  const existingCategory = await db.category.findUnique({
    where: { storeId_slug: { storeId, slug } }
  })

  if (existingCategory) throw new Error("Category with this name already exists")

  await db.category.create({
    data: { storeId, name, slug }
  })

  revalidatePath(`/${storeId}/categories`)
}
