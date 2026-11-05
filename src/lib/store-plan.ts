import { db } from "@/lib/db"
import { TRIAL_PACKAGES } from "@/lib/plans"
import { findOrCreatePlan } from "@/lib/store-onboarding"
import { normalizePlan, planIncludes, upgradeMessage, type PlanFeature } from "@/lib/plan-features"

export async function getStorePlan(storeId: string) {
  const subscription = await db.subscription.findUnique({
    where: { storeId },
    select: { plan: { select: { name: true, interval: true } } },
  })
  return { name: normalizePlan(subscription?.plan.name), interval: subscription?.plan.interval ?? "month" }
}

export async function storeHasFeature(storeId: string, feature: PlanFeature) {
  return planIncludes((await getStorePlan(storeId)).name, feature)
}

/** null when allowed, otherwise the upgrade message to show. */
export async function featureGate(storeId: string, feature: PlanFeature) {
  return (await storeHasFeature(storeId, feature)) ? null : upgradeMessage(feature)
}

/**
 * Moves the store to another plan straight away. Payments are manual (MoMo / bank), so the
 * new price simply applies from the next payment; the paid-up period is unchanged.
 */
export async function changeStorePlan(storeId: string, planName: string, interval?: string) {
  if (!TRIAL_PACKAGES.some((p) => p.name === planName)) return { error: "Choose Starter, Professional or Business." }
  const subscription = await db.subscription.findUnique({ where: { storeId }, select: { id: true, plan: { select: { interval: true } } } })
  if (!subscription) return { error: "This store has no subscription yet." }

  const plan = await findOrCreatePlan(planName, interval ?? subscription.plan.interval)
  await db.subscription.update({ where: { id: subscription.id }, data: { planId: plan.id } })
  return { success: true as const, plan: { name: plan.name, price: plan.price, interval: plan.interval } }
}
