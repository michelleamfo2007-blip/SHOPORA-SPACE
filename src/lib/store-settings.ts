import { db } from "@/lib/db"

export const STORE_SETTING_FIELDS = [
  "name",
  "description",
  "logoUrl",
  "primaryColor",
  "heroHeadline",
  "heroSubtext",
  "heroImage",
  "aboutText",
  "announcementText",
  "instagramHandle",
  "whatsappNumber",
  "tiktokHandle",
  "snapchatHandle",
  "contactEmail",
  "currency",
  "deliveryPolicy",
] as const

export type StoreSettingField = (typeof STORE_SETTING_FIELDS)[number]
export type StoreSettingsInput = Partial<Record<StoreSettingField, string | null>>

const CURRENCIES = ["GHS", "USD", "EUR", "GBP"]

/**
 * Updates only the fields that were sent, so saving one form (e.g. delivery instructions)
 * never blanks the others. Callers must check store access + OWNER/ADMIN role first.
 */
export async function updateStoreSettings(storeId: string, input: StoreSettingsInput) {
  const data: Record<string, string | null> = {}
  for (const field of STORE_SETTING_FIELDS) {
    if (!(field in input)) continue
    const raw = input[field]
    const value = typeof raw === "string" ? raw.trim() : null
    data[field] = value === "" ? null : value
  }

  if ("name" in data && !data.name) delete data.name
  if ("currency" in data && (!data.currency || !CURRENCIES.includes(data.currency))) delete data.currency
  if ("primaryColor" in data && !data.primaryColor) data.primaryColor = "#2563eb"

  await db.store.update({ where: { id: storeId }, data })
  return { success: true as const }
}

export function storeSettingsFromFormData(formData: FormData): StoreSettingsInput {
  const input: StoreSettingsInput = {}
  for (const field of STORE_SETTING_FIELDS) {
    if (formData.has(field)) input[field] = formData.get(field) as string | null
  }
  return input
}
