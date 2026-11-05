import { getRiderDeliveryHistory } from "@/lib/delivery-earnings"
import { requireMobileRider } from "@/lib/mobile-auth"

const FILTERS = ["ALL", "DELIVERED", "FAILED", "CANCELLED"] as const

/** Same list as the web rider History page. */
export async function GET(req: Request) {
  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })

  const raw = (new URL(req.url).searchParams.get("status") || "ALL").toUpperCase()
  const status = (FILTERS as readonly string[]).includes(raw) ? (raw as (typeof FILTERS)[number]) : "ALL"
  const jobs = await getRiderDeliveryHistory(auth.rider.id, status)

  return Response.json({
    jobs: jobs.map((j) => ({
      id: j.id,
      status: j.status,
      orderNumber: j.order.orderNumber,
      storeName: j.order.store.name,
      customerName: j.order.customer.name,
      dropoffAddress: j.dropoffAddress,
      feeAmount: j.feeAmount,
      riderPayout: j.riderPayout,
      deliveredAt: j.deliveredAt,
      failedReason: j.failedReason,
      updatedAt: j.updatedAt,
      // Reassigned away from this rider after they had it.
      reassigned: j.riderId !== auth.rider.id,
    })),
  })
}
