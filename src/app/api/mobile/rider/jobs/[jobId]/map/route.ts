import { db } from "@/lib/db"
import { requireMobileRider } from "@/lib/mobile-auth"
import { geocodeAddress } from "@/lib/shopora-delivery"

/** Map pins for a job the rider can see (open job, or their own active job). */
export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const auth = await requireMobileRider(req)
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status })

  const job = await db.deliveryJob.findUnique({
    where: { id: jobId },
    select: { riderId: true, status: true, pickupAddress: true, dropoffAddress: true },
  })
  const visible = job && ((job.status === "PENDING" && !job.riderId) || job.riderId === auth.rider.id)
  if (!job || !visible) return Response.json({ error: "Job not found." }, { status: 404 })

  const [pickup, dropoff] = await Promise.all([
    geocodeAddress({ exactLocation: job.pickupAddress, city: "Accra", country: "Ghana" }),
    geocodeAddress({ exactLocation: job.dropoffAddress, city: "Accra", country: "Ghana" }),
  ])

  return Response.json({ pickup, dropoff })
}
