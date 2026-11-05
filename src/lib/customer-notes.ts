import { db } from "@/lib/db"

/** Quick-pick labels; sellers can also type their own. */
export const SUGGESTED_CUSTOMER_TAGS = ["VIP", "Wholesale", "Repeat buyer", "Owes money", "Instagram", "WhatsApp"]

const MAX_TAGS = 10

export function cleanTags(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : []
  const seen = new Set<string>()
  const tags: string[] = []
  for (const value of list) {
    const tag = String(value).trim().replace(/\s+/g, " ").slice(0, 24)
    if (!tag || seen.has(tag.toLowerCase())) continue
    seen.add(tag.toLowerCase())
    tags.push(tag)
    if (tags.length >= MAX_TAGS) break
  }
  return tags
}

/** Saves the seller's private notes and labels on a customer. Callers must check store access first. */
export async function updateCustomerNotes(storeId: string, customerId: string, input: { notes?: unknown; tags?: unknown }) {
  const customer = await db.customer.findFirst({ where: { id: customerId, storeId }, select: { id: true } })
  if (!customer) return { error: "Customer not found." }

  const data: { notes?: string | null; tags?: string[] } = {}
  if ("notes" in input) data.notes = typeof input.notes === "string" ? input.notes.trim().slice(0, 1000) || null : null
  if ("tags" in input) data.tags = cleanTags(input.tags)

  const updated = await db.customer.update({ where: { id: customerId }, data, select: { id: true, notes: true, tags: true } })
  return { success: true as const, customer: updated }
}
