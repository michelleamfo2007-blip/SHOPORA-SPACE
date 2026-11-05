/** Subscription packages a new seller picks from to start their 1-month free trial (website + app). */
export const TRIAL_PACKAGES = [
  {
    name: "Starter",
    priceMonthly: 100,
    priceYearly: 1100,
    description: "Perfect for new merchants starting their online journey.",
    features: ["Up to 25 Products", "Basic Storefront Theme", "Order Management", "Standard Support"],
  },
  {
    name: "Professional",
    priceMonthly: 200,
    priceYearly: 2200,
    description: "For growing businesses that need more power.",
    features: ["Up to 50 Products", "Custom Domain Support", "Advanced Analytics", "Priority Support"],
  },
  {
    name: "Business",
    priceMonthly: 300,
    priceYearly: 3300,
    description: "Enterprise-grade features for high-volume stores.",
    features: ["Unlimited Products", "Custom Domain Support", "Multiple Staff Accounts", "24/7 Dedicated Manager"],
  },
] as const

export type PlanInterval = "month" | "year"

export function isTrialPackage(name: string) {
  return TRIAL_PACKAGES.some((p) => p.name === name)
}
