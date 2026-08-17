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
    const { data, error: resendError } = await resend.emails.send({
      from: 'Shopora <customersupport@shopora.space>',
      to: [email],
      subject: 'Welcome to the Shopora Waitlist',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #1e293b; line-height: 1.5;">
          <h2>You’re on the list!</h2>
          <p>Thank you for your interest in becoming a vendor on Shopora Space.</p>
          <p>We’re currently carefully curating our vendor community to create a high-quality shopping experience for our customers. When applications open and your business is selected to proceed, we’ll be in touch with the next steps.</p>
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-top: 24px; margin-bottom: 24px;">
            <h3 style="margin-top: 0;">Next Steps</h3>
            <p>If you’d like to be considered, simply reply to this email or contact us at <strong>shoporaspace@gmail.com</strong> with:</p>
            <ul>
              <li>Your name</li>
              <li>Your business/brand name</li>
              <li>What you sell</li>
              <li>Your social media or website</li>
              <li>A brief description of your brand</li>
            </ul>
          </div>
          <p>Our team will review your submission and, if selected, you’ll receive an invitation to begin your Shopora onboarding.</p>
          <p style="margin-top: 30px;">The Shopora Team</p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend API Error (Waitlist Join):", resendError)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Waitlist Error:", error)
    return { error: `Server error: ${error.message || String(error)}` }
  }
}
