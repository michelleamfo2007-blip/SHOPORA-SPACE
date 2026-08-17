"use server"

import { db } from "@/lib/db"
import { resend } from "@/lib/resend"

export async function joinWaitlistAction(formData: FormData) {
  try {
    const email = formData.get("email") as string

    if (!email) {
      return { error: "Email is required" }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" }
    }

    // Check if email is already in the waitlist
    const existingEntry = await db.waitlistEntry.findUnique({
      where: { email }
    })

    if (existingEntry) {
      return { error: "This email is already on the waitlist." }
    }

    // Also check if the user is already registered in the system completely
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "This email is already registered with a Shopora account." }
    }

    // Create the waitlist entry
    await db.waitlistEntry.create({
      data: {
        email,
      }
    })

    // Send the welcome email
    await resend.emails.send({
      from: 'Shopora <customersupport@shopora.space>',
      to: [email],
      subject: 'Welcome to the Shopora Waitlist',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>You're on the list!</h2>
          <p>Thank you for your interest in selling on Shopora.</p>
          <p>We are currently curating our platform to ensure the highest quality experience for our shoppers. When you are selected to proceed, we will invite you.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0;">Next Steps</h3>
            <p>Please reply to this email, or send an email directly to <strong>shoporastore@gmail.com</strong> with your personal and business requirements, including what you plan to sell and your brand details.</p>
            <p>Our team will review your submission and manually grant you onboarding access if you are selected.</p>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">The Shopora Team</p>
        </div>
      `,
    });

    return { success: true }
  } catch (error: any) {
    console.error("Waitlist Error:", error)
    return { error: `Server error: ${error.message || String(error)}` }
  }
}
