import { authenticateRider, publicRider, signMobileToken } from "@/lib/mobile-auth"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = await authenticateRider(String(body.phone || ""), String(body.password || ""))
    if ("error" in result) return Response.json({ error: result.error }, { status: 401 })

    return Response.json({
      token: signMobileToken("rider", result.rider.id),
      rider: publicRider(result.rider),
    })
  } catch (err) {
    console.error("[MOBILE_AUTH_RIDER]", err)
    return Response.json({ error: "Could not log in right now. Try again." }, { status: 500 })
  }
}
