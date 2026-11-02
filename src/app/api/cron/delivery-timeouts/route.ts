import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { DELIVERY_CONFIG } from "@/lib/delivery-config"
import { reopenDeliveryJobInternal } from "@/lib/delivery-reassign"
import { notifyRiderPickupWarning } from "@/lib/delivery-notifications"

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = Date.now()
  const warnBefore = new Date(now - DELIVERY_CONFIG.pickupWarnMinutes * 60 * 1000)
  const timeoutBefore = new Date(now - DELIVERY_CONFIG.pickupTimeoutMinutes * 60 * 1000)

  const assigned = await db.deliveryJob.findMany({
    where: {
      status: "ASSIGNED",
      riderId: { not: null },
      assignedAt: { not: null, lte: warnBefore },
    },
    include: {
      auditLogs: {
        where: { action: { in: ["TIMEOUT_WARN", "TIMEOUT_REOPEN"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  let warned = 0
  let reopened = 0

  for (const job of assigned) {
    if (!job.assignedAt) continue

    const alreadyWarned = job.auditLogs.some(
      (l) => l.action === "TIMEOUT_WARN" && l.createdAt >= job.assignedAt!
    )

    if (job.assignedAt <= timeoutBefore) {
      const result = await reopenDeliveryJobInternal({
        jobId: job.id,
        actorType: "SYSTEM",
        reason: `Auto-reopened: rider did not pick up within ${DELIVERY_CONFIG.pickupTimeoutMinutes} minutes`,
        action: "TIMEOUT_REOPEN",
        notifyPreviousRider: true,
      })
      if ("success" in result) reopened++
      continue
    }

    if (!alreadyWarned && job.assignedAt <= warnBefore) {
      await db.deliveryAuditLog.create({
        data: {
          deliveryJobId: job.id,
          riderId: job.riderId,
          actorType: "SYSTEM",
          action: "TIMEOUT_WARN",
          note: `Pickup warning at ${DELIVERY_CONFIG.pickupWarnMinutes} minutes`,
        },
      })
      await notifyRiderPickupWarning(job.id)
      warned++
    }
  }

  return Response.json({
    scanned: assigned.length,
    warned,
    reopened,
    warnMinutes: DELIVERY_CONFIG.pickupWarnMinutes,
    timeoutMinutes: DELIVERY_CONFIG.pickupTimeoutMinutes,
  })
}
