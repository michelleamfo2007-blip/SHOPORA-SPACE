import { createHmac, timingSafeEqual } from "crypto"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { normalizeRiderPhone, riderPhoneLookupVariants } from "@/lib/rider-phone"
import { LAPSED_STORE_MESSAGE } from "@/lib/store-access"
import { isSubscriptionLapsed } from "@/lib/subscription"

/** Bearer tokens for the Shopora mobile app (vendors + riders). Website cookies are unaffected. */

export type MobileTokenKind = "vendor" | "rider"

const TOKEN_VERSION = "v1"
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30

function secret() {
  return process.env.NEXTAUTH_SECRET || process.env.MOBILE_TOKEN_SECRET || "shopora-mobile-dev-secret"
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export function signMobileToken(kind: MobileTokenKind, subjectId: string) {
  const payload = `${TOKEN_VERSION}.${kind}.${subjectId}.${Date.now()}`
  return `${payload}.${sign(payload)}`
}

export function verifyMobileToken(token: string): { kind: MobileTokenKind; subjectId: string } | null {
  const parts = token.split(".")
  if (parts.length !== 5) return null
  const [version, kind, subjectId, issuedAtRaw, sig] = parts
  if (version !== TOKEN_VERSION || (kind !== "vendor" && kind !== "rider") || !subjectId) return null

  const expected = sign(parts.slice(0, 4).join("."))
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const issuedAt = Number(issuedAtRaw)
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > MAX_AGE_MS) return null

  return { kind, subjectId }
}

function bearer(req: Request) {
  const header = req.headers.get("authorization") || ""
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null
}

export async function requireMobileVendor(req: Request) {
  const token = bearer(req)
  const parsed = token ? verifyMobileToken(token) : null
  if (!parsed || parsed.kind !== "vendor") return { error: "Please log in again." as const, status: 401 }

  const user = await db.user.findUnique({
    where: { id: parsed.subjectId },
    select: { id: true, name: true, email: true, platformRole: true },
  })
  if (!user) return { error: "Account not found." as const, status: 401 }
  return { user }
}

/**
 * Same rules as the website's getStoreAccess: store member (or super admin) and subscription not lapsed.
 * Billing passes allowLapsed so a lapsed store can still pay to reactivate.
 */
export async function requireMobileStoreAccess(req: Request, storeId: string, options: { allowLapsed?: boolean } = {}) {
  const auth = await requireMobileVendor(req)
  if (auth.error !== undefined) return { error: auth.error, status: auth.status }

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      currency: true,
      subscription: { select: { status: true, currentPeriodEnd: true } },
      members: { where: { userId: auth.user.id }, select: { role: true }, take: 1 },
    },
  })
  if (!store) return { error: "Store not found." as const, status: 404 }

  const member = store.members[0]
  if (!member && auth.user.platformRole !== "SUPER_ADMIN") {
    return { error: "You don’t have access to this store." as const, status: 403 }
  }
  if (!options.allowLapsed && isSubscriptionLapsed(store.subscription)) {
    return { error: LAPSED_STORE_MESSAGE, status: 403 }
  }

  return { user: auth.user, store: { id: store.id, currency: store.currency }, role: member?.role ?? "OWNER" }
}

export async function requireMobileRider(req: Request) {
  const token = bearer(req)
  const parsed = token ? verifyMobileToken(token) : null
  if (!parsed || parsed.kind !== "rider") return { error: "Please log in again." as const, status: 401 }

  const rider = await db.rider.findUnique({ where: { id: parsed.subjectId } })
  if (!rider || rider.status !== "ACTIVE") {
    return { error: "Your rider account is not active." as const, status: 403 }
  }
  return { rider }
}

export async function authenticateVendor(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase()
  if (!email || !password) return { error: "Enter your email and password." as const }

  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  })
  if (!user?.passwordHash || !(await compare(password, user.passwordHash))) {
    return { error: "Wrong email or password." as const }
  }
  return { user }
}

export async function authenticateRider(phoneInput: string, password: string) {
  const variants = riderPhoneLookupVariants(phoneInput)
  if (!variants.length || !password) return { error: "Enter your phone number and password." as const }

  const riders = await db.rider.findMany({ where: { phone: { in: variants } }, take: 5 })
  const preferred = normalizeRiderPhone(phoneInput)
  const rider = riders.find((r) => r.phone === preferred) || riders[0] || null

  if (!rider || !(await compare(password, rider.passwordHash))) {
    return { error: "Wrong phone number or password. Try 0XXXXXXXXX or +233XXXXXXXXX." as const }
  }
  if (rider.status === "PENDING") {
    return { error: "Your account is waiting for Shopora approval. We’ll activate you soon." as const }
  }
  if (rider.status !== "ACTIVE") {
    return { error: "Your rider account is not active. Contact Shopora." as const }
  }
  return { rider }
}

export function vendorStoresFor(userId: string) {
  return db.storeMember.findMany({
    where: { userId },
    select: {
      role: true,
      store: { select: { id: true, name: true, slug: true, currency: true, logoUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

export function publicRider(rider: {
  id: string
  name: string
  phone: string
  isOnline: boolean
  walletOwed: number
  ratingAvg: number
  ratingCount: number
}) {
  return {
    id: rider.id,
    name: rider.name,
    phone: rider.phone,
    isOnline: rider.isOnline,
    walletOwed: rider.walletOwed,
    ratingAvg: rider.ratingAvg,
    ratingCount: rider.ratingCount,
  }
}
