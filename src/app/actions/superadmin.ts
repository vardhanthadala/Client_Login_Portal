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

      await tx.superAdminLog.create({
        data: {
          action: "AGENCY_CREATED",
          message: `Agency "${agencyName}" was created on a 15-day Free Trial.`,
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

import Razorpay from "razorpay"

export async function cancelSubscriptionAction(tenantId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) return { error: "Agency not found" }

    if (tenant.razorpaySubscriptionId) {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
         return { error: "Superadmin Razorpay keys are not configured in environment variables." }
      }
      
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })

      // Cancel at cycle end
      await razorpay.subscriptions.cancel(tenant.razorpaySubscriptionId, true)
    }

    await prisma.$transaction([
      prisma.tenant.update({
        where: { id: tenantId },
        data: { cancelAtPeriodEnd: true }
      }),
      prisma.superAdminLog.create({
        data: {
          action: "SUBSCRIPTION_CANCELLED",
          message: `Subscription for agency "${tenant.name}" was set to cancel at cycle end.`,
          tenantId
        }
      })
    ])

    revalidatePath("/superadmin/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Cancel subscription error:", error)
    let errorMessage = "Failed to cancel subscription."
    if (error?.error?.description) {
      errorMessage = error.error.description
    } else if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    return { error: errorMessage }
  }
}

export async function getSuperAdminAnalytics() {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        subscriptionStart: true,
        subscriptionEnd: true
      }
    })
    
    // Quick calculations for the charts
    // 1. Plan Distribution
    let freeCount = 0;
    let premiumMonthlyCount = 0;
    let premiumYearlyCount = 0;
    
    tenants.forEach(t => {
      if (t.subscriptionPlan === "FREE") freeCount++;
      if (t.subscriptionPlan === "PREMIUM_MONTHLY") premiumMonthlyCount++;
      if (t.subscriptionPlan === "PREMIUM_YEARLY") premiumYearlyCount++;
    })
    
    // 2. Growth over last 6 months
    const growthData: any[] = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthName = months[d.getMonth()]
      
      const countForMonth = tenants.filter(t => {
        const tDate = new Date(t.createdAt)
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear()
      }).length
      
      growthData.push({ name: monthName, agencies: countForMonth })
    }

    return { 
      success: true, 
      data: {
        planDistribution: [
          { name: "Free", value: freeCount },
          { name: "Premium Monthly", value: premiumMonthlyCount },
          { name: "Premium Yearly", value: premiumYearlyCount }
        ],
        growth: growthData
      }
    }
  } catch (error) {
    console.error("Failed to get analytics", error)
    return { error: "Failed to get analytics" }
  }
}

export async function getSuperAdminLogs() {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    const logs = await prisma.superAdminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        tenant: { select: { name: true } }
      }
    })
    return { success: true, data: logs }
  } catch (error) {
    console.error("Failed to get logs", error)
    return { error: "Failed to get logs" }
  }
}

