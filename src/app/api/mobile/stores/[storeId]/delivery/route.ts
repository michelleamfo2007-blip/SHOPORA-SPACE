import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { updateShoporaDeliverySettings } from "@/lib/shopora-delivery-settings"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { shoporaDeliveryEnabled: true, pickupAddress: true, pickupCity: true, deliveryPolicy: true },
  })
  if (!store) return Response.json({ error: "Store not found." }, { status: 404 })

  return Response.json({
    canEdit: access.role === "OWNER" || access.role === "ADMIN",
    shoporaDeliveryEnabled: store.shoporaDeliveryEnabled,
    pickupAddress: store.pickupAddress ?? "",
    pickupCity: store.pickupCity ?? "Accra",
    deliveryPolicy: store.deliveryPolicy ?? "",
  })
}

/** Save Shopora Delivery settings and/or the store's own delivery instructions. */
export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })
  if (access.role !== "OWNER" && access.role !== "ADMIN") {
    return Response.json({ error: "You do not have permission to change delivery settings." }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))

  if (body.shoporaDelivery) {
    const result = await updateShoporaDeliverySettings(storeId, {
      enabled: body.shoporaDelivery.enabled === true,
      pickupAddress: String(body.shoporaDelivery.pickupAddress || ""),
      pickupCity: String(body.shoporaDelivery.pickupCity || ""),
    })
    if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  }

  if (typeof body.deliveryPolicy === "string") {
    await db.store.update({ where: { id: storeId }, data: { deliveryPolicy: body.deliveryPolicy.trim() || null } })
    revalidatePath(`/${storeId}/shipping`)
    revalidatePath("/", "layout")
  }

  return Response.json({ success: true })
}
