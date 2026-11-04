import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"

type Params = { params: Promise<{ storeId: string; ticketId: string }> }

/** Mark a ticket resolved or reopen it. */
export async function PATCH(req: Request, { params }: Params) {
  const { storeId, ticketId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await db.supportTicket.updateMany({
    where: { id: ticketId, storeId },
    data: { status: body.resolved === true ? "RESOLVED" : "OPEN" },
  })
  if (result.count === 0) return Response.json({ error: "Ticket not found." }, { status: 404 })

  revalidatePath(`/${storeId}/support`)
  return Response.json({ success: true })
}

export async function DELETE(req: Request, { params }: Params) {
  const { storeId, ticketId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  await db.supportTicket.deleteMany({ where: { id: ticketId, storeId } })
  revalidatePath(`/${storeId}/support`)
  return Response.json({ success: true })
}
