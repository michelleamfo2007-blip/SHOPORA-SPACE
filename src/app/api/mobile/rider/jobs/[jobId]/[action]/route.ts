import { requireMobileRider } from "@/lib/mobile-auth"
import { acceptDeliveryJob, markJobDelivered, markJobPickedUp, reportFailedDelivery } from "@/lib/rider-jobs"

/** POST /api/mobile/rider/jobs/:jobId/(accept|pickup|deliver|fail) */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string; action: string }> }
) {
  const { jobId, action } = await params
  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))

  let result: { error: string } | { success: true }
  switch (action) {
    case "accept":
      result = await acceptDeliveryJob(auth.rider, jobId)
      break
    case "pickup":
      result = await markJobPickedUp(auth.rider, jobId)
      break
    case "deliver":
      result = await markJobDelivered(auth.rider, jobId, String(body.otp || ""))
      break
    case "fail":
      result = await reportFailedDelivery(auth.rider, {
        jobId,
        reason: String(body.reason || ""),
        notes: body.notes ? String(body.notes) : null,
      })
      break
    default:
      return Response.json({ error: "Unknown action." }, { status: 404 })
  }

  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ success: true })
}
