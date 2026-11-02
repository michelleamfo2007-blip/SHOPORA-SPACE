"use server"

import { db } from "@/lib/db"
import { DEFAULT_ACCRA_ZONES } from "@/lib/delivery-zones"
import { revalidatePath } from "next/cache"

async function requireSuperAdmin() {
  const { getServerSession } = await import("next-auth/next")
  const { authOptions } = await import("@/auth")
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" as const }
  const admin = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } })
  if (admin?.platformRole !== "SUPER_ADMIN") return { error: "Unauthorized" as const }
  return { ok: true as const }
}

export async function upsertDeliveryZoneAction(formData: FormData) {
  const auth = await requireSuperAdmin()
  if ("error" in auth) return { error: auth.error }

  const id = String(formData.get("id") || "").trim() || null
  const name = String(formData.get("name") || "").trim()
  const keywords = String(formData.get("keywords") || "").trim()
  const feeMultiplier = Number(formData.get("feeMultiplier") || 1)
  const flatAdd = Number(formData.get("flatAdd") || 0)
  const sortOrder = Number(formData.get("sortOrder") || 0)
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true"
  const minFeeRaw = String(formData.get("minFee") || "").trim()
  const maxFeeRaw = String(formData.get("maxFee") || "").trim()
  const minFee = minFeeRaw ? Number(minFeeRaw) : null
  const maxFee = maxFeeRaw ? Number(maxFeeRaw) : null

  if (!name || !keywords) return { error: "Name and keywords are required." }
  if (!Number.isFinite(feeMultiplier) || feeMultiplier <= 0) {
    return { error: "Fee multiplier must be a positive number (e.g. 1.15)." }
  }

  const data = {
    name,
    keywords,
    feeMultiplier,
    flatAdd: Number.isFinite(flatAdd) ? flatAdd : 0,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    isActive,
    minFee: minFee != null && Number.isFinite(minFee) ? minFee : null,
    maxFee: maxFee != null && Number.isFinite(maxFee) ? maxFee : null,
  }

  if (id) {
    await db.deliveryZone.update({ where: { id }, data })
  } else {
    await db.deliveryZone.create({ data })
  }

  revalidatePath("/super-admin/delivery-zones")
  return { success: true as const }
}

export async function deleteDeliveryZoneAction(zoneId: string) {
  const auth = await requireSuperAdmin()
  if ("error" in auth) return { error: auth.error }
  await db.deliveryZone.delete({ where: { id: zoneId } })
  revalidatePath("/super-admin/delivery-zones")
  return { success: true as const }
}

export async function seedDefaultDeliveryZonesAction() {
  const auth = await requireSuperAdmin()
  if ("error" in auth) return { error: auth.error }

  const count = await db.deliveryZone.count()
  if (count > 0) return { error: "Zones already exist. Add or edit them manually." }

  await db.deliveryZone.createMany({
    data: DEFAULT_ACCRA_ZONES.map((z) => ({
      name: z.name,
      keywords: z.keywords,
      feeMultiplier: z.feeMultiplier,
      flatAdd: z.flatAdd,
      sortOrder: z.sortOrder,
      isActive: true,
    })),
  })

  revalidatePath("/super-admin/delivery-zones")
  return { success: true as const, count: DEFAULT_ACCRA_ZONES.length }
}
