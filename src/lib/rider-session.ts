import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"
import { db } from "@/lib/db"

const COOKIE = "shopora_rider"
const MAX_AGE_SEC = 60 * 60 * 24 * 14 // 14 days

function secret() {
  return process.env.NEXTAUTH_SECRET || process.env.RIDER_SESSION_SECRET || "shopora-rider-dev-secret"
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export async function setRiderSession(riderId: string) {
  const payload = `${riderId}.${Date.now()}`
  const value = `${payload}.${sign(payload)}`
  const jar = await cookies()
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  })
}

export async function clearRiderSession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function getRiderIdFromSession(): Promise<string | null> {
  const jar = await cookies()
  const raw = jar.get(COOKIE)?.value
  if (!raw) return null
  const parts = raw.split(".")
  if (parts.length < 3) return null
  const sig = parts.pop()!
  const payload = parts.join(".")
  const expected = sign(payload)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  const riderId = payload.split(".")[0]
  return riderId || null
}

export async function requireRider() {
  const riderId = await getRiderIdFromSession()
  if (!riderId) return { error: "Please log in" as const }

  const rider = await db.rider.findUnique({ where: { id: riderId } })
  if (!rider || rider.status !== "ACTIVE") {
    await clearRiderSession()
    return { error: "Your rider account is not active" as const }
  }
  return { rider }
}
