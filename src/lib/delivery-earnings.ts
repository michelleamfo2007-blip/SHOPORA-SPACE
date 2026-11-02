import { db } from "@/lib/db"
import type { DeliveryJobStatus } from "@prisma/client"

function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfWeek(d = new Date()) {
  const x = startOfDay(d)
  const day = x.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + mondayOffset)
  return x
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export async function getRiderEarningsSummary(riderId: string) {
  const delivered = await db.deliveryJob.findMany({
    where: { riderId, status: "DELIVERED" },
    select: {
      id: true,
      riderPayout: true,
      shoporaCut: true,
      feeAmount: true,
      deliveredAt: true,
      dropoffAddress: true,
      order: { select: { orderNumber: true, store: { select: { name: true } } } },
    },
    orderBy: { deliveredAt: "desc" },
  })

  const todayStart = startOfDay()
  const weekStart = startOfWeek()
  const monthStart = startOfMonth()

  let total = 0
  let today = 0
  let week = 0
  let month = 0

  for (const job of delivered) {
    const payout = job.riderPayout
    total += payout
    const at = job.deliveredAt
    if (!at) continue
    if (at >= todayStart) today += payout
    if (at >= weekStart) week += payout
    if (at >= monthStart) month += payout
  }

  const rider = await db.rider.findUnique({
    where: { id: riderId },
    select: { walletOwed: true },
  })

  return {
    total,
    today,
    week,
    month,
    completedCount: delivered.length,
    pendingShoporaCut: rider?.walletOwed ?? 0,
    transactions: delivered.slice(0, 50),
  }
}

export async function getRiderDeliveryHistory(
  riderId: string,
  status: "DELIVERED" | "FAILED" | "CANCELLED" | "ALL" = "ALL"
) {
  const statuses: DeliveryJobStatus[] =
    status === "ALL" ? ["DELIVERED", "FAILED", "CANCELLED"] : [status]

  return db.deliveryJob.findMany({
    where: {
      status: { in: statuses },
      OR: [{ riderId }, { previousRiderId: riderId }],
    },
    include: {
      order: {
        select: {
          orderNumber: true,
          store: { select: { name: true } },
          customer: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  })
}
