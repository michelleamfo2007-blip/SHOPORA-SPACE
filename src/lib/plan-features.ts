/**
 * Which seller tools each plan includes. Starter keeps the core store; Professional adds the
 * everyday selling tools; Business adds money insights, bulk work and staff accounts.
 */
export const PLAN_ORDER = ["Starter", "Professional", "Business"] as const
export type PlanName = (typeof PLAN_ORDER)[number]

export const PLAN_FEATURES = {
  manualOrders: { label: "Record WhatsApp, Instagram & walk-in orders", plan: "Professional" },
  pos: { label: "Shop till (POS) for walk-in sales", plan: "Professional" },
  paymentReminders: { label: "WhatsApp payment reminders", plan: "Professional" },
  shareKit: { label: "Share kit for WhatsApp Status & Instagram", plan: "Professional" },
  customerNotes: { label: "Customer notes & tags", plan: "Professional" },
  monthlyGoal: { label: "Monthly sales goal", plan: "Professional" },
  salesReports: { label: "Sales reports", plan: "Professional" },
  profit: { label: "Profit tracking with cost prices", plan: "Business" },
  reportExport: { label: "Download reports for Excel", plan: "Business" },
  bulkEdit: { label: "Bulk edit prices & stock", plan: "Business" },
  team: { label: "Staff accounts", plan: "Business" },
} as const satisfies Record<string, { label: string; plan: PlanName }>

export type PlanFeature = keyof typeof PLAN_FEATURES

export function normalizePlan(name: string | null | undefined): PlanName {
  return (PLAN_ORDER as readonly string[]).includes(name ?? "") ? (name as PlanName) : "Starter"
}

export function planIncludes(planName: string | null | undefined, feature: PlanFeature) {
  const plan = normalizePlan(planName)
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(PLAN_FEATURES[feature].plan)
}

export function featuresForPlan(planName: string | null | undefined) {
  return (Object.keys(PLAN_FEATURES) as PlanFeature[]).filter((f) => planIncludes(planName, f))
}

export function upgradeMessage(feature: PlanFeature) {
  const { label, plan } = PLAN_FEATURES[feature]
  return `${label} is on the ${plan} plan. Upgrade in Billing to use it.`
}

/** New tools listed on pricing cards, grouped by the plan that first includes them. */
export function featuresAddedIn(plan: PlanName) {
  return (Object.values(PLAN_FEATURES) as { label: string; plan: PlanName }[]).filter((f) => f.plan === plan).map((f) => f.label)
}
