import { authenticateVendor, signMobileToken, vendorStoresFor } from "@/lib/mobile-auth"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = await authenticateVendor(String(body.email || ""), String(body.password || ""))
    if ("error" in result) return Response.json({ error: result.error }, { status: 401 })

    const { user } = result
    const memberships = await vendorStoresFor(user.id)
    if (memberships.length === 0) {
      return Response.json(
        { error: "No store on this account yet. Create your store on shopora.space first." },
        { status: 403 }
      )
    }

    return Response.json({
      token: signMobileToken("vendor", user.id),
      user: { id: user.id, name: user.name, email: user.email },
      stores: memberships.map((m) => ({ ...m.store, role: m.role })),
    })
  } catch (err) {
    console.error("[MOBILE_AUTH_VENDOR]", err)
    return Response.json({ error: "Could not log in right now. Try again." }, { status: 500 })
  }
}
