import { publicRider, requireMobileRider, requireMobileVendor, vendorStoresFor, verifyMobileToken } from "@/lib/mobile-auth"

/** Restores the app session on launch: tells the app who the token belongs to. */
export async function GET(req: Request) {
  const header = req.headers.get("authorization") || ""
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : ""
  const parsed = token ? verifyMobileToken(token) : null
  if (!parsed) return Response.json({ error: "Please log in again." }, { status: 401 })

  if (parsed.kind === "vendor") {
    const auth = await requireMobileVendor(req)
    if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })
    const memberships = await vendorStoresFor(auth.user.id)
    return Response.json({
      kind: "vendor",
      user: { id: auth.user.id, name: auth.user.name, email: auth.user.email },
      stores: memberships.map((m) => ({ ...m.store, role: m.role })),
    })
  }

  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })
  return Response.json({ kind: "rider", rider: publicRider(auth.rider) })
}
