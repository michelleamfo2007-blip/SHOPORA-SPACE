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

    return { success: true }
  } catch (error: any) {
    console.error("Signup Error:", error);
    return { error: `Server error: ${error.message || String(error)}` }
  }
}
