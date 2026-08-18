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
      from: 'Michelle from Shopora <customersupport@shopora.space>',
      to: [email],
      subject: 'Welcome to the Shopora Waitlist',
      html: `
        <p>Hi there,</p>
        <p>You’re on the list! Thank you for your interest in becoming a vendor on Shopora Space.</p>
        <p>We’re currently carefully curating our vendor community to create a high-quality shopping experience for our customers. When applications open and your business is selected to proceed, we’ll be in touch with the next steps.</p>
        <p>If you’d like to be considered, simply reply to this email or contact us at shoporaspace@gmail.com with:</p>
        <p>- Your name<br>- Your business/brand name<br>- What you sell<br>- Your social media<br>- A brief description of your brand</p>
        <p>We look forward to seeing what you’re building!</p>
        <p>Best,<br>Michelle from Shopora</p>
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
