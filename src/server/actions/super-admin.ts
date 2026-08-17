"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { StoreStatus } from "@prisma/client"

export async function toggleStoreStatusAction(storeId: string, currentStatus: StoreStatus) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admins can perform this action.")
  }

  const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"

  await db.store.update({
    where: { id: storeId },
    data: { status: newStatus }
  })

  revalidatePath("/super-admin/moderation")
  
  return { success: true, newStatus }
}

import { resend } from "@/lib/resend"

export async function approveWaitlistAction(entryId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admins can perform this action.")
  }

  const entry = await db.waitlistEntry.update({
    where: { id: entryId },
    data: { status: "INVITED" }
  })

  // Send the invite email
  try {
    const { data, error } = await resend.emails.send({
      from: "Shopora Space <customersupport@shopora.space>",
      to: entry.email,
      subject: "You've been invited to Shopora Space!",
      html: `
        <h1>Welcome to Shopora Space!</h1>
        <p>Your waitlist application has been approved.</p>
        <p>You can now sign up and create your store by visiting:</p>
        <p><a href="https://shopora.space/signup">https://shopora.space/signup</a></p>
      `
    })

    if (error) {
      console.error("Resend API Error:", error)
    }
  } catch (error) {
    console.error("Failed to send invite email:", error)
  }

  revalidatePath("/super-admin/waitlist")
  return { success: true }
}
