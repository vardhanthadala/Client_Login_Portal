"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", Object.fromEntries(formData))
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    throw error
  }
}

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"

async function getAuthSession() {
  const reqCookies = await cookies()
  const reqHeaders = await headers()
  
  const req = {
    cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
    headers: Object.fromEntries(reqHeaders.entries())
  } as any

  return getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
}

export async function updatePasswordAction(formData: FormData) {
  try {
    const token = await getAuthSession()
    if (!token?.id) return { error: "Unauthorized" }

    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!newPassword || newPassword !== confirmPassword) {
      return { error: "Passwords do not match or are missing" }
    }

    if (newPassword.length < 8) {
      return { error: "Password must be at least 8 characters" }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: token.id as string },
      data: {
        passwordHash,
        mustChangePassword: false
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Failed to update password:", error)
    return { error: "Failed to update password" }
  }
}
