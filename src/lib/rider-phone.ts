/** Normalize Ghana phone numbers for rider login / signup. */
export function normalizeRiderPhone(input: string): string {
  let raw = input.replace(/[^\d+]/g, "").trim()
  if (!raw) return ""

  // Keep a single leading + for international form
  if (raw.startsWith("00")) raw = `+${raw.slice(2)}`

  const digits = raw.replace(/\D/g, "")

  // 233XXXXXXXXX (12 digits) → +233XXXXXXXXX
  if (digits.startsWith("233") && digits.length === 12) {
    return `+${digits}`
  }

  // 0XXXXXXXXX (10 digits local) → +233XXXXXXXXX
  if (digits.startsWith("0") && digits.length === 10) {
    return `+233${digits.slice(1)}`
  }

  // 9-digit local without leading 0 → +233XXXXXXXXX
  if (digits.length === 9 && /^[235]/.test(digits)) {
    return `+233${digits}`
  }

  if (raw.startsWith("+") && digits.length >= 10) return `+${digits}`
  return digits
}

/** All common stored forms so older accounts still match. */
export function riderPhoneLookupVariants(input: string): string[] {
  const normalized = normalizeRiderPhone(input)
  if (!normalized) return []

  const digits = normalized.replace(/\D/g, "")
  const local10 =
    digits.startsWith("233") && digits.length === 12 ? `0${digits.slice(3)}` : digits.startsWith("0") ? digits : ""
  const intl = digits.startsWith("233") && digits.length === 12 ? `+${digits}` : normalized.startsWith("+") ? normalized : `+${digits}`
  const bare233 = digits.startsWith("233") ? digits : digits.startsWith("0") && digits.length === 10 ? `233${digits.slice(1)}` : digits

  return [...new Set([normalized, intl, local10, bare233, digits].filter(Boolean))]
}
