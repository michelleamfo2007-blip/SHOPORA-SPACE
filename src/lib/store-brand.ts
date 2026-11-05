/** Brand colours sellers can pick from. Kept to deep, print-like tones that read well on the ivory storefront. */
export const BRAND_COLORS = [
  { name: "Ink", hex: "#1c1917" },
  { name: "Espresso", hex: "#4a3426" },
  { name: "Gold", hex: "#8a6a3d" },
  { name: "Terracotta", hex: "#a2502e" },
  { name: "Rose", hex: "#a8536b" },
  { name: "Plum", hex: "#5b2a4a" },
  { name: "Forest", hex: "#2f4a3a" },
  { name: "Navy", hex: "#1e2a44" },
] as const

export const DEFAULT_BRAND_COLOR = "#1c1917"

/** Older stores were created with this blue before sellers could choose; it reads as unbranded. */
const LEGACY_DEFAULT_COLOR = "#2563eb"

export function getStoreAccent(primaryColor: string | null | undefined) {
  if (!primaryColor || primaryColor.toLowerCase() === LEGACY_DEFAULT_COLOR) return DEFAULT_BRAND_COLOR
  return primaryColor
}
