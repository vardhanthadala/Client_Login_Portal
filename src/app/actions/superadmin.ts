"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
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

export async function createAgencyAction(formData: FormData) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    const agencyName = formData.get("agencyName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!agencyName || !email || !password) {
      return { error: "Missing required fields" }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "A user with this email already exists." }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const trialDays = parseInt((formData.get("trialDays") as string) || "15", 10)
    const subscriptionEnd = new Date()
    subscriptionEnd.setDate(subscriptionEnd.getDate() + trialDays)

    await prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: {
          name: agencyName,
          subscriptionPlan: "FREE",
          subscriptionStatus: "ACTIVE", // Start as active trial
          subscriptionEnd
        }
      })

      await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "ADMIN",
          tenantId: tenant.id
        }
      })
    })

    revalidatePath("/superadmin/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Create company error:", error)
    return { error: "Failed to create company. Please try again." }
  }
}
