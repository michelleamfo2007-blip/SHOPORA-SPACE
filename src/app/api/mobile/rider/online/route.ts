import { requireMobileRider } from "@/lib/mobile-auth"
import { setRiderOnline } from "@/lib/rider-jobs"

export async function POST(req: Request) {
  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))
  const result = await setRiderOnline(auth.rider, body.online === true)
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json(result)
}
