import { SHOPORA_DELIVERY_CONFIG } from "@/lib/shopora-delivery"

/** Bump this when rider terms change so existing riders can be asked to re-accept later. */
export const RIDER_TERMS_VERSION = "2026-11-02"

export const RIDER_PLATFORM_CUT_PERCENT = Math.round(SHOPORA_DELIVERY_CONFIG.platformCutRate * 100)

export const RIDER_TERMS = {
  version: RIDER_TERMS_VERSION,
  title: "Shopora Rider Terms & Conditions",
  updatedLabel: "2 November 2026",
  city: "Accra",
  cutPercent: RIDER_PLATFORM_CUT_PERCENT,
  sections: [
    {
      heading: "1. Who these terms cover",
      body: "These terms apply to anyone who registers as a Shopora Delivery rider on shopora.space. By creating an account or accepting a delivery, you agree to these terms.",
    },
    {
      heading: "2. Service area",
      body: "Shopora Delivery currently operates in Accra only. You may only accept jobs within the Accra service area shown in the rider app.",
    },
    {
      heading: "3. How pay works",
      body: `The customer pays the store for the goods. The customer pays the delivery fee to you (the rider) on arrival. From every completed delivery fee, Shopora’s platform fee is ${RIDER_PLATFORM_CUT_PERCENT}% of that delivery fee. You keep the remaining ${100 - RIDER_PLATFORM_CUT_PERCENT}%. Example: on a GHS 40 delivery fee, Shopora’s cut is GHS ${(40 * RIDER_PLATFORM_CUT_PERCENT) / 100} and you keep GHS ${40 - (40 * RIDER_PLATFORM_CUT_PERCENT) / 100}.`,
    },
    {
      heading: "4. Settling Shopora’s cut",
      body: `After each completed delivery, ${RIDER_PLATFORM_CUT_PERCENT}% is added to what you owe Shopora. You must settle this amount to Shopora’s MoMo on the schedule Shopora communicates (typically weekly). Failure to settle may lead to suspension.`,
    },
    {
      heading: "5. Accepting and completing jobs",
      body: "Only online, approved riders can accept open jobs. One active delivery at a time. You must pick up within the stated window or the job may be reassigned. Delivery is only marked complete after the customer’s 6-digit OTP is verified. Do not ask for the OTP before you arrive with the order.",
    },
    {
      heading: "6. Conduct",
      body: "Treat customers and vendors respectfully. Do not open, use, or damage packages. Report failed deliveries honestly with a reason. Fraud, theft, harassment, or repeated no-shows can lead to immediate suspension.",
    },
    {
      heading: "7. Account approval",
      body: "Signing up does not guarantee activation. Shopora may approve, reject, suspend, or deactivate rider accounts at its discretion.",
    },
    {
      heading: "8. Changes",
      body: "Shopora may update these terms and the platform fee percentage. Continued use of the rider app after notice of changes means you accept the updated terms.",
    },
  ],
} as const
