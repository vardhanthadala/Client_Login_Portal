"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function setupAdminAction(formData: FormData) {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    })

    if (adminExists) {
      return { error: "Setup is already complete. An admin user exists." }
    }

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password || password.length < 8) {
      return { error: "Please provide a valid email and a password of at least 8 characters." }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    await prisma.user.create({
      data: {
        email: email,
        passwordHash,
        role: "ADMIN",
      },
    })
    
    return { success: true, message: "Admin user created successfully! You can now log in." }
  } catch (error: any) {
    return { error: `Error: ${error.message}` }
  }
}
