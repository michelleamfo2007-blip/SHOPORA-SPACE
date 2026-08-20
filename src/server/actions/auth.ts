"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"


export async function signUpAction(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password || !name) {
      return { error: "Missing required fields" }
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // ENFORCE WAITLIST: User must be invited before they can sign up
    const waitlistEntry = await db.waitlistEntry.findUnique({
      where: { email }
    })

    if (!waitlistEntry || waitlistEntry.status !== "INVITED") {
      return { error: "You must be invited from the waitlist to create an account." }
    }

    // Hash password
    const passwordHash = await hash(password, 10)

    // Create user
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      }
    })

    // Update waitlist status to ONBOARDED
    await db.waitlistEntry.update({
      where: { email },
      data: { status: "ONBOARDED" }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Signup Error:", error);
    return { error: `Server error: ${error.message || String(error)}` }
  }
}
