import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const [tickets, customers] = await Promise.all([
    db.supportTicket.findMany({
      where: { storeId },
      select: {
        id: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true,
        customer: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.customer.findMany({ where: { storeId }, select: { id: true, name: true, phone: true }, orderBy: { name: "asc" } }),
  ])

  return Response.json({ tickets, customers })
}

/** Log a customer issue (same as "Log New Issue" on the web). */
export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const customerId = String(body.customerId || "")
  const subject = String(body.subject || "").trim()
  const message = String(body.message || "").trim()
  if (!customerId || !subject || !message) {
    return Response.json({ error: "Choose a customer and add a subject and details." }, { status: 400 })
  }

  const customer = await db.customer.findFirst({ where: { id: customerId, storeId }, select: { id: true } })
  if (!customer) return Response.json({ error: "Customer not found." }, { status: 404 })

  await db.supportTicket.create({ data: { storeId, customerId, subject, message } })
  revalidatePath(`/${storeId}/support`)
  return Response.json({ success: true })
}
