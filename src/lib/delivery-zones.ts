import { db } from "@/lib/db"

export type MatchedZone = {
  id: string
  name: string
  feeMultiplier: number
  flatAdd: number
  minFee: number | null
  maxFee: number | null
}

export function applyZoneToFee(
  baseFee: number,
  zone: MatchedZone | null,
  platformCutRate: number
): { fee: number; shoporaCut: number; riderPayout: number; zoneName?: string } {
  if (!zone) {
    const shoporaCut = Math.round(baseFee * platformCutRate * 100) / 100
    return {
      fee: baseFee,
      shoporaCut,
      riderPayout: Math.round((baseFee - shoporaCut) * 100) / 100,
    }
  }

  let fee = baseFee * zone.feeMultiplier + zone.flatAdd
  if (zone.minFee != null) fee = Math.max(zone.minFee, fee)
  if (zone.maxFee != null) fee = Math.min(zone.maxFee, fee)
  fee = Math.round(fee)
  const shoporaCut = Math.round(fee * platformCutRate * 100) / 100
  return {
    fee,
    shoporaCut,
    riderPayout: Math.round((fee - shoporaCut) * 100) / 100,
    zoneName: zone.name,
  }
}

/** First active zone whose keyword appears in the dropoff text wins (by sortOrder). */
export async function matchDeliveryZone(dropoffText: string): Promise<MatchedZone | null> {
  const hay = dropoffText.toLowerCase()
  const zones = await db.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })

  for (const zone of zones) {
    const keys = zone.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)
    if (keys.some((k) => hay.includes(k))) {
      return {
        id: zone.id,
        name: zone.name,
        feeMultiplier: zone.feeMultiplier,
        flatAdd: zone.flatAdd,
        minFee: zone.minFee,
        maxFee: zone.maxFee,
      }
    }
  }
  return null
}

export const DEFAULT_ACCRA_ZONES = [
  {
    name: "East Legon / Airport",
    keywords: "east legon,airport residential,cantonments,roman ridge",
    feeMultiplier: 1.15,
    flatAdd: 0,
    sortOrder: 10,
  },
  {
    name: "Spintex / Tema corridor",
    keywords: "spintex,tema,sakumono,lashibi,community 25",
    feeMultiplier: 1.2,
    flatAdd: 0,
    sortOrder: 20,
  },
  {
    name: "Madina / Adenta",
    keywords: "madina,adenta,haatso,agbogba,pantang",
    feeMultiplier: 1.15,
    flatAdd: 0,
    sortOrder: 30,
  },
  {
    name: "Dansoman / Ablekuma",
    keywords: "dansoman,ablekuma,weija,mccarthy hill",
    feeMultiplier: 1.1,
    flatAdd: 0,
    sortOrder: 40,
  },
  {
    name: "Central Accra / Osu / Labone",
    keywords: "osu,labone,ridge,circle,kaneshie,adabraka,jamestown,accra central",
    feeMultiplier: 1,
    flatAdd: 0,
    sortOrder: 50,
  },
] as const
