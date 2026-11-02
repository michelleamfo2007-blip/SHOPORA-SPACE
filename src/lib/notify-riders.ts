import { db } from "@/lib/db"
import { resend } from "@/lib/resend"
import { RiderNewJobEmail } from "@/emails/RiderNewJobEmail"

/** Email every active Accra rider who has an email when a delivery job becomes available. */
export async function notifyRidersOfOpenJob(orderId: string) {
  const job = await db.deliveryJob.findUnique({
    where: { orderId },
    include: {
      order: {
        select: {
          orderNumber: true,
          deliveryMethod: true,
          status: true,
          store: { select: { name: true } },
        },
      },
    },
  })

  if (!job || job.status !== "PENDING" || job.riderId) return
  if (job.order.deliveryMethod !== "SHOPORA" || job.order.status !== "PROCESSING") return

  const riders = await db.rider.findMany({
    where: {
      status: "ACTIVE",
      isOnline: true,
      email: { not: null },
    },
    select: { id: true, name: true, email: true },
  })

  const withEmail = riders.filter((r) => r.email)
  if (withEmail.length === 0) {
    console.warn("No active Accra riders with email to notify for job", job.id)
    return
  }

  const dashboardUrl = "https://www.shopora.space/rider"
  await Promise.all(
    withEmail.map((rider) =>
      resend.emails.send({
        from: "Shopora Delivery <orders@shopora.space>",
        to: rider.email!,
        subject: `New Accra job ${job.order.orderNumber} · GHS ${job.feeAmount.toFixed(2)}`,
        react: RiderNewJobEmail({
          riderName: rider.name.split(/\s+/)[0] || "there",
          storeName: job.order.store.name,
          orderNumber: job.order.orderNumber,
          feeAmount: job.feeAmount,
          riderPayout: job.riderPayout,
          pickupAddress: job.pickupAddress,
          dropoffAddress: job.dropoffAddress,
          distanceKm: job.distanceKm,
          durationMin: job.durationMin,
          dashboardUrl,
        }),
      })
    )
  )
}
