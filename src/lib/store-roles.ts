/**
 * Who can do what in a store. Owners and admins run everything; staff handle day-to-day
 * orders, products and customers but can't see money settings, reports or the team.
 */
export type StoreRole = "OWNER" | "ADMIN" | "STAFF"

export const ROLE_LABELS: Record<StoreRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
}

export const ROLE_DESCRIPTIONS: Record<StoreRole, string> = {
  OWNER: "Full access, including billing and the team.",
  ADMIN: "Everything except removing the owner.",
  STAFF: "Orders, products, stock and customers only. No reports, payments or settings.",
}

export function isStoreManager(role: string | null | undefined) {
  return role === "OWNER" || role === "ADMIN"
}

/** Dashboard sections (path after /[storeId]/) staff may open. */
export const STAFF_SECTIONS = ["orders", "products", "categories", "inventory", "customers", "reviews", "support", "guide"]

export function staffCanOpen(section: string) {
  return STAFF_SECTIONS.includes(section)
}

/** Orders that count as sales: payment confirmed and not cancelled/refunded. */
export const PAID_ORDER_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED"] as const
