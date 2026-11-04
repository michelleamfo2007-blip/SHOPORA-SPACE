import { db } from "@/lib/db"
import { DELIVERY_CONFIG } from "@/lib/delivery-config"
import { publicRider, requireMobileRider } from "@/lib/mobile-auth"

/** Rider home: fresh profile, open Accra jobs (when online) and the rider's active deliveries. */
export async function GET(req: Request) {
  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })
  const { rider } = auth

  const [openJobs, activeJobs] = await Promise.all([
    rider.isOnline
      ? db.deliveryJob.findMany({
          where: {
            status: "PENDING",
            riderId: null,
            order: {
              deliveryMethod: "SHOPORA",
              status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
            },
          },
          select: {
            id: true,
            status: true,
            feeAmount: true,
            riderPayout: true,
            pickupAddress: true,
            dropoffAddress: true,
            distanceKm: true,
            durationMin: true,
            order: { select: { orderNumber: true, store: { select: { name: true } } } },
          },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    db.deliveryJob.findMany({
      where: { riderId: rider.id, status: { in: ["ASSIGNED", "PICKED_UP"] } },
      select: {
        id: true,
        status: true,
        feeAmount: true,
        riderPayout: true,
        pickupAddress: true,
        dropoffAddress: true,
        distanceKm: true,
        durationMin: true,
        order: {
          select: {
            orderNumber: true,
            store: { select: { name: true, whatsappNumber: true } },
            customer: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    }),
  ])

  const shape = (job: (typeof activeJobs)[number] | (typeof openJobs)[number]) => ({
    id: job.id,
    status: job.status,
    feeAmount: job.feeAmount,
    riderPayout: job.riderPayout,
    pickupAddress: job.pickupAddress,
    dropoffAddress: job.dropoffAddress,
    distanceKm: job.distanceKm,
    durationMin: job.durationMin,
    orderNumber: job.order.orderNumber,
    storeName: job.order.store.name,
  })

  return Response.json({
    rider: publicRider(rider),
    failReasons: DELIVERY_CONFIG.failReasons,
    openJobs: openJobs.map(shape),
    activeJobs: activeJobs.map((job) => ({
      ...shape(job),
      storePhone: job.order.store.whatsappNumber,
      customerName: job.order.customer.name,
      customerPhone: job.order.customer.phone,
    })),
  })
}
