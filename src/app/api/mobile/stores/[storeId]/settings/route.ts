import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { STORE_SETTING_FIELDS, updateStoreSettings, type StoreSettingsInput } from "@/lib/store-settings"

const EDITABLE = [
  "name",
  "description",
  "currency",
  "logoUrl",
  "heroImage",
  "primaryColor",
  "contactEmail",
  "whatsappNumber",
  "instagramHandle",
  "tiktokHandle",
  "snapchatHandle",
  "heroHeadline",
  "heroSubtext",
  "aboutText",
  "announcementText",
  "slug",
] as const

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: Object.fromEntries(EDITABLE.map((f) => [f, true])) as Record<(typeof EDITABLE)[number], true>,
  })
  if (!store) return Response.json({ error: "Store not found." }, { status: 404 })

  return Response.json({ canEdit: access.role === "OWNER" || access.role === "ADMIN", settings: store })
}

/** Store details & branding. Only the fields sent are changed. */
export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  if (access.role !== "OWNER" && access.role !== "ADMIN") {
    return Response.json({ error: "Only the store owner or an admin can change settings." }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const input: StoreSettingsInput = {}
  for (const field of STORE_SETTING_FIELDS) {
    if ((EDITABLE as readonly string[]).includes(field) && field in body) {
      input[field] = body[field] == null ? null : String(body[field])
    }
  }

  try {
    await updateStoreSettings(storeId, input)
  } catch (err) {
    console.error("[MOBILE_SETTINGS_PATCH]", err)
    return Response.json({ error: "Could not save settings." }, { status: 500 })
  }

  revalidatePath("/", "layout")
  return Response.json({ success: true })
}
