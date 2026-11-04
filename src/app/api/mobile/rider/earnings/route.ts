import { getRiderEarningsSummary } from "@/lib/delivery-earnings"
import { requireMobileRider } from "@/lib/mobile-auth"

export async function GET(req: Request) {
  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })

  const summary = await getRiderEarningsSummary(auth.rider.id)

  return Response.json({
    total: summary.total,
    today: summary.today,
    week: summary.week,
    month: summary.month,
    completedCount: summary.completedCount,
    owedToShopora: summary.pendingShoporaCut,
    transactions: summary.transactions.map((job) => ({
      id: job.id,
      orderNumber: job.order.orderNumber,
      storeName: job.order.store.name,
      deliveredAt: job.deliveredAt,
      dropoffAddress: job.dropoffAddress,
      riderPayout: job.riderPayout,
      feeAmount: job.feeAmount,
    })),
  })
}
