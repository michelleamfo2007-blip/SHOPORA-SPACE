import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/mobile-auth"

function bearer(req: Request) {
  const header = req.headers.get("authorization") || ""
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null
}

/** Register this phone's Expo push token for the logged-in seller or rider. */
export async function POST(req: Request) {
  const token = bearer(req)
  const parsed = token ? verifyMobileToken(token) : null
  if (!parsed) return Response.json({ error: "Please log in again." }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const pushToken = String(body.pushToken || "")
  if (!/^Expo(nent)?PushToken\[.+\]$/.test(pushToken)) {
    return Response.json({ error: "Invalid push token." }, { status: 400 })
  }

  const owner =
    parsed.kind === "vendor"
      ? { userId: parsed.subjectId, riderId: null }
      : { riderId: parsed.subjectId, userId: null }

  await db.pushToken.upsert({
    where: { token: pushToken },
    create: { token: pushToken, platform: String(body.platform || "") || null, ...owner },
    update: { platform: String(body.platform || "") || null, ...owner },
  })

  return Response.json({ success: true })
}

/** Stop notifications to this phone (called on log out). */
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}))
  const pushToken = String(body.pushToken || "")
  if (pushToken) await db.pushToken.deleteMany({ where: { token: pushToken } })
  return Response.json({ success: true })
}
