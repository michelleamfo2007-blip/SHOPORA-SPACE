/** Accra Shopora Delivery rules */
export const DELIVERY_CONFIG = {
  /** One active job (ASSIGNED or PICKED_UP) per rider */
  oneActiveJobAtATime: true,
  /** Customer OTP lifetime after pickup */
  otpTtlMinutes: 12 * 60,
  /** Max wrong OTP attempts before lockout (admin must reopen) */
  otpMaxAttempts: 5,
  /**
   * After a rider accepts, they must mark picked up within this window
   * or the job is auto-reopened for other online riders.
   */
  pickupTimeoutMinutes: 30,
  /** Warn the assigned rider this many minutes before the timeout */
  pickupWarnMinutes: 20,
  failReasons: [
    { value: "CUSTOMER_UNAVAILABLE", label: "Customer unavailable" },
    { value: "INCORRECT_ADDRESS", label: "Incorrect delivery address" },
    { value: "CUSTOMER_REFUSED", label: "Customer refused delivery" },
    { value: "UNABLE_TO_CONTACT", label: "Unable to contact customer" },
    { value: "OTHER", label: "Other" },
  ] as const,
} as const

export type DeliveryFailReasonValue = (typeof DELIVERY_CONFIG.failReasons)[number]["value"]
