import { db } from "@/lib/db"
import { PAID_ORDER_STATUSES } from "@/lib/store-roles"

/** This month's paid sales against the seller's target. */
export async function getMonthlyGoal(storeId: string) {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const [store, sales] = await Promise.all([
    db.store.findUnique({ where: { id: storeId }, select: { monthlyGoal: true } }),
    db.order.aggregate({
      where: { storeId, status: { in: [...PAID_ORDER_STATUSES] }, createdAt: { gte: monthStart, lt: nextMonth } },
      _sum: { totalAmount: true },
    }),
  ])

  const goal = store?.monthlyGoal ?? null
  const achieved = sales._sum.totalAmount ?? 0
  const daysInMonth = Math.round((nextMonth.getTime() - monthStart.getTime()) / 86400000)
  const daysLeft = Math.max(0, daysInMonth - now.getUTCDate() + 1)

  return {
    goal,
    achieved,
    percent: goal ? Math.min(100, Math.round((achieved / goal) * 100)) : null,
    daysLeft,
    monthLabel: monthStart.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" }),
  }
}

export async function setMonthlyGoal(storeId: string, raw: unknown) {
  const value = raw === null || raw === "" ? null : Number(raw)
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100_000_000)) {
    return { error: "Enter a goal amount, e.g. 5000." }
  }
  await db.store.update({ where: { id: storeId }, data: { monthlyGoal: value || null } })
  return { success: true as const }
}
