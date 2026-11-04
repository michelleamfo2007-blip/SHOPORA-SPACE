"use server"

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { revalidatePath } from "next/cache"
import { requireStoreAccess } from "@/lib/store-access"
import { createCategory } from "@/lib/category-service"

export async function createCategoryAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const storeId = formData.get("storeId") as string
  const name = formData.get("name") as string

  if (!storeId || !name) throw new Error("Missing required fields")

  await requireStoreAccess(storeId)

  const result = await createCategory(storeId, name)
  if ("error" in result) throw new Error(result.error)

  revalidatePath(`/${storeId}/categories`)
}
