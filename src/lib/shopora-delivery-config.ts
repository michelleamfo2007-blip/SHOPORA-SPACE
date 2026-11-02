/**
 * Client-safe Shopora Delivery constants (no Node/DB imports).
 * Keep pricing/cut rates here so rider UI and terms can import without pulling `pg`.
 */

export const SHOPORA_DELIVERY_CONFIG = {
  city: "Accra",
  currency: "GHS",
  /** Lower Accra pricing — still distance/time based. */
  baseFee: 10,
  perKm: 2,
  perMinute: 0.35,
  minFee: 15,
  maxFee: 60,
  /**
   * Used when the typed address is Accra but not found on the free map index.
   * Customer can still checkout; rider navigates with the written address in Google Maps.
   */
  fallbackFee: 25,
  fallbackDistanceKm: 8,
  fallbackDurationMin: 25,
  /** Share of delivery fee owed to Shopora (rider remits later). */
  platformCutRate: 0.15,
  /** Rough Accra metro bounding box for v1. */
  bounds: {
    minLat: 5.48,
    maxLat: 5.78,
    minLng: -0.35,
    maxLng: 0.05,
  },
} as const
