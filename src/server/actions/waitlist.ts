"use server"

import { db } from "@/lib/db"

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

    return { success: true }
  } catch (error: any) {
    console.error("Waitlist Error:", error)
    return { error: `Server error: ${error.message || String(error)}` }
  }
}
