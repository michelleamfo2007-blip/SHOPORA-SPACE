/** Accra Shopora Delivery Stage-1 rules */
export const DELIVERY_CONFIG = {
  /** One active job (ASSIGNED or PICKED_UP) per rider */
  oneActiveJobAtATime: true,
  /** Customer OTP lifetime after pickup */
  otpTtlMinutes: 12 * 60,
  /** Max wrong OTP attempts before lockout (admin must reopen) */
  otpMaxAttempts: 5,
  failReasons: [
    { value: "CUSTOMER_UNAVAILABLE", label: "Customer unavailable" },
    { value: "INCORRECT_ADDRESS", label: "Incorrect delivery address" },
    { value: "CUSTOMER_REFUSED", label: "Customer refused delivery" },
    { value: "UNABLE_TO_CONTACT", label: "Unable to contact customer" },
    { value: "OTHER", label: "Other" },
  ] as const,
} as const

export type DeliveryFailReasonValue = (typeof DELIVERY_CONFIG.failReasons)[number]["value"]
