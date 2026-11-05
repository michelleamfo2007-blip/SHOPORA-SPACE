import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { signMobileToken, vendorStoresFor } from "@/lib/mobile-auth"
import { claimStoreInvites } from "@/lib/team"

/** Seller account signup from the app. The same email and password also log in on shopora.space. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")

    if (name.length < 2) return Response.json({ error: "Enter your full name." }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    const existing = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    })
    if (existing) {
      return Response.json({ error: "An account with this email already exists. Log in instead." }, { status: 409 })
    }

    const user = await db.user.create({
      data: { name, email, passwordHash: await hash(password, 10) },
      select: { id: true, name: true, email: true },
    })
    await claimStoreInvites(user.id, user.email)
    const memberships = await vendorStoresFor(user.id)

    return Response.json({
      token: signMobileToken("vendor", user.id),
      user,
      stores: memberships.map((m) => ({ ...m.store, role: m.role })),
    })
  } catch (err) {
    console.error("[MOBILE_VENDOR_SIGNUP]", err)
    return Response.json({ error: "Could not create your account. Try again." }, { status: 500 })
  }
}
