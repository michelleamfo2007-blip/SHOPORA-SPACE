import { db } from "@/lib/db"

export function categorySlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

/** Shared by the dashboard action and the mobile API. Callers must check store access first. */
export async function createCategory(storeId: string, nameInput: string) {
  const name = nameInput.trim()
  if (!name) return { error: "Enter a category name." }
  const slug = categorySlug(name)

  const existing = await db.category.findUnique({ where: { storeId_slug: { storeId, slug } } })
  if (existing) return { error: "Category with this name already exists" }

  const category = await db.category.create({ data: { storeId, name, slug } })
  return { category }
}
