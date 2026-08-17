"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"

export async function signUpAction(formData: FormData) {
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

  // Redirect to login page after successful registration
  redirect("/login")
}
