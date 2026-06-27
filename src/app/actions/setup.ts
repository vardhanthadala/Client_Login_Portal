"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function setupAdminAction() {
  try {
    const passwordHash = await bcrypt.hash("8639504644", 10)
    
    await prisma.user.upsert({
      where: { email: "vardhan.thadala23@gmail.com" },
      update: {},
      create: {
        email: "vardhan.thadala23@gmail.com",
        passwordHash,
        role: "ADMIN",
      },
    })
    
    return { message: "Admin user created successfully! You can now log in." }
  } catch (error: any) {
    return { message: `Error: ${error.message}` }
  }
}
