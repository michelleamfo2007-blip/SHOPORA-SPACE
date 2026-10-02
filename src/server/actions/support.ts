"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireStoreAccess } from "@/lib/store-access"
import { redirect } from "next/navigation"

export async function createSupportTicketAction(storeId: string, formData: FormData) {
  await requireStoreAccess(storeId)

  const customerId = formData.get("customerId") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  if (!customerId || !subject || !message) {
    throw new Error("Missing required fields")
  }

  await db.supportTicket.create({
    data: {
      storeId,
      customerId,
      subject,
      message
    }
  })

  revalidatePath(`/${storeId}/support`)
  redirect(`/${storeId}/support`)
}

export async function resolveSupportTicketAction(storeId: string, ticketId: string) {
  await requireStoreAccess(storeId)

  await db.supportTicket.update({
    where: { id: ticketId, storeId },
    data: { status: "RESOLVED" }
  })

  revalidatePath(`/${storeId}/support`)
  return { success: true }
}

export async function reopenSupportTicketAction(storeId: string, ticketId: string) {
  await requireStoreAccess(storeId)

  await db.supportTicket.update({
    where: { id: ticketId, storeId },
    data: { status: "OPEN" }
  })

  revalidatePath(`/${storeId}/support`)
  return { success: true }
}

export async function deleteSupportTicketAction(storeId: string, ticketId: string) {
  await requireStoreAccess(storeId)

  await db.supportTicket.delete({
    where: { id: ticketId, storeId }
  })

  revalidatePath(`/${storeId}/support`)
  return { success: true }
}
