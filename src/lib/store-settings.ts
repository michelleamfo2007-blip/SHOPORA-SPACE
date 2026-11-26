import { db } from "@/lib/db"
import { DEFAULT_BRAND_COLOR } from "@/lib/store-brand"
import { slugFromNameIfUncustomised } from "@/lib/store-onboarding"

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
  "privacyPolicy",
  "returnPolicy",
] as const

export type StoreSettingField = (typeof STORE_SETTING_FIELDS)[number]
export type StoreSettingsInput = Partial<Record<StoreSettingField, string | null>> & {
  /** On/off switches, sent as booleans (or "true"/"false" from forms). */
  whatsappOrderAlerts?: boolean | string | null
}

const CURRENCIES = ["GHS", "USD", "EUR", "GBP"]

/**
 * Updates only the fields that were sent, so saving one form (e.g. delivery instructions)
 * never blanks the others. Callers must check store access + OWNER/ADMIN role first.
 */
export async function updateStoreSettings(storeId: string, input: StoreSettingsInput) {
  const data: Record<string, string | boolean | null> = {}
  if ("whatsappOrderAlerts" in input && input.whatsappOrderAlerts != null) {
    data.whatsappOrderAlerts = input.whatsappOrderAlerts === true || input.whatsappOrderAlerts === "true"
  }
  for (const field of STORE_SETTING_FIELDS) {
    if (!(field in input)) continue
    const raw = input[field]
    const value = typeof raw === "string" ? raw.trim() : null
    data[field] = value === "" ? null : value
  }

  if ("name" in data && !data.name) delete data.name
  if ("currency" in data && (typeof data.currency !== "string" || !CURRENCIES.includes(data.currency))) delete data.currency
  if ("primaryColor" in data && !/^#[0-9a-f]{6}$/i.test(String(data.primaryColor ?? ""))) data.primaryColor = DEFAULT_BRAND_COLOR

  const current = await db.store.findUnique({ where: { id: storeId }, select: { id: true, name: true, slug: true } })
  if (!current) throw new Error("Store not found")

  const nextName = typeof data.name === "string" ? data.name : null
  const nextSlug = nextName ? await slugFromNameIfUncustomised(current, nextName) : null
  if (nextSlug) {
    data.slug = nextSlug
    await db.domain.upsert({
      where: { domainName: current.slug },
      create: { storeId, domainName: current.slug, isVerified: true },
      update: { storeId, isVerified: true },
    })
  }

  await db.store.update({ where: { id: storeId }, data })
  return { success: true as const, slug: nextSlug ?? current.slug }
}

export function storeSettingsFromFormData(formData: FormData): StoreSettingsInput {
  const input: StoreSettingsInput = {}
  for (const field of STORE_SETTING_FIELDS) {
    if (formData.has(field)) input[field] = formData.get(field) as string | null
  }
  if (formData.has("whatsappOrderAlerts")) input.whatsappOrderAlerts = formData.get("whatsappOrderAlerts") as string
  return input
}
