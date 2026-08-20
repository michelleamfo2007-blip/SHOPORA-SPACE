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
      from: "Michelle from Shopora <customersupport@shopora.space>",
      to: entry.email,
      subject: "Your Shopora Space application has been approved",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
          <h2 style="color: #0f172a; margin-bottom: 5px;">Shopora Space</h2>
          <p>Hi ${entry.email.split('@')[0]},</p>
          <p>Great news! Your application to join Shopora Space has been approved.</p>
          <p>You can now create your Shopora account and set up your online store.</p>
          <p><strong>Get started here:</strong> <a href="https://shopora.space/signup" style="color: #2563eb;">https://shopora.space/signup</a></p>
          <p>Once you complete signup, you'll be able to create your store and get your unique Shopora store link.</p>

          <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
            <h3 style="color: #0f172a; margin-top: 0;">Vendor Launch Guide</h3>
            <p style="margin-bottom: 20px;">We've put together a comprehensive guide to help you set up your store, add products, and launch successfully.</p>
            <a href="https://shopora.space/Vendor-Launch-Guide.pdf" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Download Launch Guide (PDF)
            </a>
          </div>
          
          <p>Welcome to Shopora Space!</p>
          <p>Best,<br>Michelle</p>
        </div>
      `
    })

    if (error) {
      console.error("Resend API Error:", error)
      // Rollback the status if email failed
      await db.waitlistEntry.update({
        where: { id: entryId },
        data: { status: "PENDING" }
      })
      return { success: false, error: error.message }
    }
  } catch (error: any) {
    console.error("Failed to send invite email:", error)
    // Rollback the status if email failed
    await db.waitlistEntry.update({
      where: { id: entryId },
      data: { status: "PENDING" }
    })
    return { success: false, error: error.message || "Failed to send email" }
  }

  revalidatePath("/super-admin/waitlist")
  return { success: true }
}
