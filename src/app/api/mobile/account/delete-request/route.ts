import { requireMobileRider, requireMobileVendor, verifyMobileToken } from "@/lib/mobile-auth"
import { requestAccountDeletion } from "@/lib/account-deletion"

/** In-app "Delete my account" for sellers and riders. */
export async function POST(req: Request) {
  const header = req.headers.get("authorization") || ""
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : ""
  const parsed = token ? verifyMobileToken(token) : null
  if (!parsed) return Response.json({ error: "Please log in again." }, { status: 401 })
  const body = await req.json().catch(() => ({}))

  if (parsed.kind === "vendor") {
    const auth = await requireMobileVendor(req)
    if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })
    if (!auth.user.email) return Response.json({ error: "Your account has no email. Contact shoporaspace@gmail.com." }, { status: 400 })
    const result = await requestAccountDeletion({
      accountType: "seller",
      email: auth.user.email,
      name: auth.user.name,
      reason: body.reason,
      verifiedAccountId: auth.user.id,
      source: "app",
    })
    return "error" in result ? Response.json(result, { status: 400 }) : Response.json(result)
  }

  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })
  if (!auth.rider.email) return Response.json({ error: "Your account has no email. Contact shoporaspace@gmail.com." }, { status: 400 })
  const result = await requestAccountDeletion({
    accountType: "rider",
    email: auth.rider.email,
    name: auth.rider.name,
    reason: body.reason,
    verifiedAccountId: auth.rider.id,
    source: "app",
  })
  return "error" in result ? Response.json(result, { status: 400 }) : Response.json(result)
}
