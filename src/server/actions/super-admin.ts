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
      subject: "Your Shopora Space application has been approved 🎉",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #1e293b; line-height: 1.5;">
          <p>Hi ${entry.email.split('@')[0]},</p>
          <p>Great news! 🎉 Your application to join Shopora Space has been approved.</p>
          <p>You can now create your Shopora account and set up your online store.</p>
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-top: 24px; margin-bottom: 24px;">
            <h3 style="margin-top: 0;">Get started:</h3>
            <p><a href="https://shopora.space/signup" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://shopora.space/signup</a></p>
          </div>
          <p>Once you complete signup, you’ll be able to create your store and get your unique Shopora store link.</p>
          <p style="margin-top: 30px;">Welcome to Shopora Space! 🛍️</p>
        </div>
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
