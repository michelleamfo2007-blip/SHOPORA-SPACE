import { db } from "@/lib/db"

/** Shared by the dashboard action and the mobile API. Callers must check store access first. */
export async function createDiscount(
  storeId: string,
  input: { code: string; type: string; value: number; usageLimit: number | null }
) {
  const code = input.code.toUpperCase().replace(/\s+/g, "")
  if (!code || !input.type || Number.isNaN(input.value)) return { error: "Missing required fields" }
  if (input.type !== "PERCENTAGE" && input.type !== "FIXED") return { error: "Choose percentage or fixed amount." }

  const existing = await db.discount.findUnique({ where: { storeId_code: { storeId, code } } })
  if (existing) return { error: `The code ${code} already exists.` }

  const discount = await db.discount.create({
    data: { storeId, code, type: input.type, value: input.value, usageLimit: input.usageLimit },
  })
  return { discount }
}
