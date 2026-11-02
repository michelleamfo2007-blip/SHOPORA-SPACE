import { createHash, randomInt, timingSafeEqual } from "crypto"
import { hash, compare } from "bcryptjs"
import { DELIVERY_CONFIG } from "@/lib/delivery-config"

function pepper() {
  return process.env.NEXTAUTH_SECRET || process.env.DELIVERY_OTP_SECRET || "shopora-otp-dev"
}

/** Fast hash for compare after bcrypt — actually we use bcrypt for storage. */
export async function hashDeliveryOtp(otp: string) {
  return hash(`${pepper()}:${otp}`, 10)
}

export async function verifyDeliveryOtp(otp: string, otpHash: string) {
  return compare(`${pepper()}:${otp}`, otpHash)
}

export function generateSixDigitOtp() {
  return String(randomInt(100000, 1000000))
}

export function otpExpiresAt(from = new Date()) {
  return new Date(from.getTime() + DELIVERY_CONFIG.otpTtlMinutes * 60 * 1000)
}

/** Constant-time-ish digit check before bcrypt */
export function isValidOtpFormat(otp: string) {
  return /^\d{6}$/.test(otp)
}

export function fingerprintOtp(otp: string) {
  return createHash("sha256").update(`${pepper()}:${otp}`).digest("hex").slice(0, 12)
}

export function safeEqualStr(a: string, b: string) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}
