import { headers } from "next/headers"

const PLATFORM_DEFAULT_COLOR = "#2563eb"
const NEUTRAL_ACCENT = "#1c1917"

/** Stores are served at /storefront/[domain] on platform hosts, and at the root on their own domain. */
export async function getStorefrontBasePath(domain: string) {
  const host = (await headers()).get("host") || ""
  const isPlatformHost =
    host.includes("vercel.app") || host.includes("localhost:3000") || host === "shopora.space" || host === "www.shopora.space"
  return isPlatformHost ? `/storefront/${domain}` : ""
}

/** The platform's default blue reads as unbranded, so stores that never picked a colour get a neutral accent. */
export function getStoreAccent(primaryColor: string | null | undefined) {
  if (!primaryColor || primaryColor.toLowerCase() === PLATFORM_DEFAULT_COLOR) return NEUTRAL_ACCENT
  return primaryColor
}

export function whatsappLink(number: string, message?: string) {
  const digits = number.replace(/[^0-9]/g, "")
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`
}

export function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
