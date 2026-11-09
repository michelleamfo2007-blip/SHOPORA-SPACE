/** Subscription packages a new seller picks from to start their 1-month free trial (website + app). */
export const TRIAL_PACKAGES = [
  {
    name: "Starter",
    priceMonthly: 100,
    priceYearly: 1100,
    description: "Everything you need to open and run your online store.",
    features: [
      "Up to 25 products",
      "Your own store + the Shopora seller app",
      "Orders, stock, customers & reviews",
      "MoMo & bank payments straight to you",
      "Shopora Delivery in Accra",
      "Standard support",
    ],
  },
  {
    name: "Professional",
    priceMonthly: 200,
    priceYearly: 2200,
    description: "Tools for shops that sell on WhatsApp and Instagram too.",
    features: [
      "Everything in Starter",
      "Up to 50 products",
      "Shop till (POS) for your physical shop",
      "Record WhatsApp, Instagram & walk-in orders",
      "WhatsApp payment reminders",
      "Share kit for WhatsApp Status & Instagram",
      "Customer notes & tags",
      "Sales reports & monthly goal",
      "Priority support",
    ],
  },
  {
    name: "Business",
    priceMonthly: 300,
    priceYearly: 3300,
    description: "Every tool, for high-volume shops with a team.",
    features: [
      "Everything in Professional",
      "Unlimited products",
      "Profit tracking with cost prices",
      "Download reports for Excel",
      "Bulk edit prices & stock",
      "Staff accounts with limited access",
      "Dedicated account manager",
    ],
  },
] as const

export type PlanInterval = "month" | "year"

export function isTrialPackage(name: string) {
  return TRIAL_PACKAGES.some((p) => p.name === name)
}
