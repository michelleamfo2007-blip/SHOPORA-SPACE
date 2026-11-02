import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { notifyRidersOfOpenJob } from "@/lib/notify-riders"
import { resend } from "@/lib/resend"
import { RiderJobUpdateEmail } from "@/emails/RiderJobUpdateEmail"

async function audit(
  tx: Prisma.TransactionClient,
  data: {
    deliveryJobId: string
    riderId?: string | null
    actorType: string
    actorId?: string | null
    action: "REOPENED" | "TIMEOUT_WARN" | "TIMEOUT_REOPEN"
    note?: string
  }
) {
  await tx.deliveryAuditLog.create({
    data: {
      deliveryJobId: data.deliveryJobId,
      riderId: data.riderId ?? null,
      actorType: data.actorType,
      actorId: data.actorId ?? null,
      action: data.action,
      note: data.note,
    },
  })
}

/** Clear assignment and put job back on the open board. Shared by admin + cron. */
export async function reopenDeliveryJobInternal(opts: {
  jobId: string
  actorType: "ADMIN" | "SYSTEM"
  actorId?: string | null
  reason: string
  action?: "REOPENED" | "TIMEOUT_REOPEN"
  notifyPreviousRider?: boolean
}) {
  const job = await db.deliveryJob.findUnique({
    where: { id: opts.jobId },
    include: {
      order: true,
      rider: { select: { id: true, name: true, email: true } },
    },
  })
  if (!job) return { error: "Job not found." as const }
  if (job.status === "DELIVERED") return { error: "Completed deliveries cannot be reopened." as const }
  if (job.status === "PENDING" && !job.riderId) return { error: "This job is already open." as const }

  const previousRider = job.rider

  await db.$transaction(async (tx) => {
    await tx.deliveryJob.update({
      where: { id: opts.jobId },
      data: {
        previousRiderId: job.riderId,
        riderId: null,
        status: "PENDING",
        assignedAt: null,
        pickedUpAt: null,
        failedReason: null,
        failedNotes: null,
        failedAt: null,
        deliveryOtpHash: null,
        deliveryOtpCode: null,
        deliveryOtpExpiresAt: null,
        deliveryOtpAttempts: 0,
      },
    })
    if (job.order.status === "SHIPPED") {
      await tx.order.update({
        where: { id: job.orderId },
        data: { status: "PROCESSING" },
      })
    }
    await audit(tx, {
      deliveryJobId: opts.jobId,
      riderId: job.riderId,
      actorType: opts.actorType,
      actorId: opts.actorId ?? null,
      action: opts.action || "REOPENED",
      note: opts.reason,
    })
  })

  if (opts.notifyPreviousRider !== false && previousRider?.email) {
    try {
      await resend.emails.send({
        from: "Shopora Delivery <orders@shopora.space>",
        to: previousRider.email,
        subject: `Delivery reassigned · ${job.order.orderNumber}`,
        react: RiderJobUpdateEmail({
          riderName: previousRider.name.split(/\s+/)[0] || "there",
          kind: "REASSIGNED",
          orderNumber: job.order.orderNumber,
          storeName: undefined,
          note: opts.reason,
          dashboardUrl: "https://www.shopora.space/rider",
        }),
      })
    } catch (err) {
      console.error("reopen previous rider email:", err)
    }
  }

  try {
    await notifyRidersOfOpenJob(job.orderId)
  } catch (err) {
    console.error("reopen notify open job:", err)
  }

  return { success: true as const, orderId: job.orderId, trackingToken: job.order.trackingToken }
}
