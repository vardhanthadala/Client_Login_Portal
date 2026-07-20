"use server"

import { auth } from "@/auth"

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

export async function cancelSubscriptionAction(tenantId: string, reason: string = "Other") {
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
        data: { 
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
          cancellationReason: reason
        }
      }),
      prisma.superAdminLog.create({
        data: {
          action: "SUBSCRIPTION_CANCELLED",
          message: `Subscription for agency "${tenant.name}" was set to cancel at cycle end. Reason: ${reason}`,
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
      // The chart is meant to show active tenants only
      if (t.subscriptionStatus !== "ACTIVE") return;

      const plan = (t.subscriptionPlan || "FREE").toUpperCase().trim();
      
      if (plan.includes("MONTHLY")) {
        premiumMonthlyCount++;
      } else if (plan.includes("YEARLY")) {
        premiumYearlyCount++;
      } else {
        freeCount++; // Fallback any 'Free', null, or improperly named plans to Free
      }
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
        tenant: {
          select: { 
            name: true,
            id: true,
            users: {
              where: { role: "ADMIN" },
              select: { image: true }
            }
          } 
        }
      }
    })
    return { success: true, data: logs }
  } catch (error) {
    console.error("Failed to get logs", error)
    return { error: "Failed to get logs" }
  }
}

export async function getSuperadminMrrAction() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return { success: true, data: { mrr: 0, arr: 0, error: "Razorpay keys missing" } }
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    // Fetch all active subscriptions
    // In production with >100 agencies, implement pagination (skip/count).
    const queryParams: any = { count: 100 }
    const subscriptions: any = await rzp.subscriptions.all(queryParams)
    
    // Fetch all plans to map plan_id to actual amounts
    const plansResult: any = await rzp.plans.all({ count: 100 })
    
    // Create a map of plan details
    const plansMap = new Map<string, { amount: number, interval: string, currency: string }>()
    if (plansResult.items) {
      plansResult.items.forEach((p: any) => {
        plansMap.set(p.id, {
          amount: Number(p.item.amount) / 100, // convert from subunits
          interval: p.period,
          currency: p.item.currency
        })
      })
    }

    let totalMrrInr = 0

    // Typical conversion rate fallback if USD (dynamically you'd use a forex API, but static is fine for display)
    const USD_TO_INR = 83.5

    if (subscriptions.items) {
      for (const sub of subscriptions.items) {
        if (sub.status !== "active") continue;
        const plan = plansMap.get(sub.plan_id)
        if (plan) {
          let subMrr = 0
        if (plan.interval === "yearly") {
          subMrr = plan.amount / 12
        } else if (plan.interval === "monthly") {
          subMrr = plan.amount
        } else if (plan.interval === "weekly") {
          subMrr = plan.amount * 4.33
        } else if (plan.interval === "daily") {
          subMrr = plan.amount * 30
        } else {
          subMrr = plan.amount // fallback
        }

        // Convert to INR if it's USD
        if (plan.currency === "USD") {
          subMrr = subMrr * USD_TO_INR
        }

        totalMrrInr += subMrr
        }
      }
    }

    return { 
      success: true, 
      data: { 
        mrr: totalMrrInr, 
        arr: totalMrrInr * 12 
      } 
    }
  } catch (error: any) {
    console.error("Failed to calculate MRR:", error)
    return { error: error.message || "Failed to calculate MRR" }
  }
}

export async function getChurnAnalyticsAction() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    // Get the start of the current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Find all tenants cancelled this month
    const cancelledTenants = await prisma.tenant.findMany({
      where: {
        cancelledAt: {
          gte: startOfMonth
        }
      },
      select: {
        cancellationReason: true
      }
    })

    const totalChurn = cancelledTenants.length

    // Group by reason
    const reasonCounts: Record<string, number> = {}
    cancelledTenants.forEach(t => {
      const reason = t.cancellationReason || "Unknown"
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })

    const breakdown = Object.entries(reasonCounts).map(([reason, count]) => ({
      name: reason,
      value: count
    }))

    return {
      success: true,
      data: {
        totalChurn,
        breakdown
      }
    }
  } catch (error) {
    console.error("Failed to get churn analytics", error)
    return { error: "Failed to get churn analytics" }
  }
}

export async function overrideSubscriptionAction(tenantId: string, newPlan: string, newEndDate: Date | null) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) return { error: "Agency not found" }

    await prisma.$transaction([
      prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: newPlan,
          subscriptionEnd: newEndDate,
          subscriptionStatus: "ACTIVE", // Force active if overridden
          cancelAtPeriodEnd: false, // Reset cancellation
          cancelledAt: null,
          cancellationReason: null
        }
      }),
      prisma.superAdminLog.create({
        data: {
          action: "SUBSCRIPTION_OVERRIDDEN",
          message: `Subscription for agency "${tenant.name}" was manually overridden to ${newPlan}.`,
          tenantId
        }
      })
    ])

    revalidatePath("/superadmin/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to override subscription", error)
    return { error: "Failed to override subscription" }
  }
}

export async function updateSuperAdminProfileAction(formData: FormData) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const imageUrl = formData.get("imageUrl") as string | null

    if (!name) {
      return { error: "Name is required" }
    }

    await prisma.user.update({
      where: { id: token.id as string },
      data: {
        name,
        image: imageUrl || undefined
      }
    })

    revalidatePath("/superadmin/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update super admin profile:", error)
    return { error: "Failed to update profile" }
  }
}

export async function getMaintenanceMode() {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: "global" }
    })
    
    let isMaintenance = settings?.isMaintenanceMode || false;
    
    if (!isMaintenance && settings?.scheduledMaintenanceStart) {
       const now = new Date();
       if (now >= settings.scheduledMaintenanceStart) {
         if (!settings.scheduledMaintenanceEnd || now <= settings.scheduledMaintenanceEnd) {
            isMaintenance = true;
         }
       }
    }
    
    return { success: true, isMaintenanceMode: isMaintenance }
  } catch (error) {
    console.error("Failed to fetch maintenance mode", error)
    return { success: false, isMaintenanceMode: false }
  }
}

export async function setMaintenanceMode(isMaintenanceMode: boolean) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    const updateData: any = { isMaintenanceMode }
    if (!isMaintenanceMode) {
      updateData.scheduledMaintenanceStart = null
      updateData.scheduledMaintenanceEnd = null
    }

    await prisma.platformSettings.upsert({
      where: { id: "global" },
      update: updateData,
      create: { id: "global", ...updateData }
    })
    
    // Log it
    await prisma.superAdminLog.create({
      data: {
        action: "MAINTENANCE_MODE_TOGGLED",
        message: `Maintenance mode was turned ${isMaintenanceMode ? "ON" : "OFF (and schedule cleared)"}.`
      }
    })

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to toggle maintenance mode", error)
    return { error: error.message || "Failed to toggle maintenance mode" }
  }
}

import { sendBroadcastEmail } from "@/lib/mail"

export async function sendBroadcastAction(data: { subject: string; message: string; sendEmail: boolean; sendInApp: boolean; startTime?: string; endTime?: string; isMaintenanceType?: boolean }) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "SUPER_ADMIN") return { error: "Unauthorized" }

    const { subject, sendEmail, sendInApp, startTime, endTime, isMaintenanceType } = data
    let { message } = data
    if (!subject || !message) return { error: "Subject and message are required." }

    // If it's a maintenance broadcast and a schedule is provided, append times to message and update PlatformSettings
    const scheduledStart = startTime ? new Date(startTime) : null;
    const scheduledEnd = endTime ? new Date(endTime) : null;

    if (isMaintenanceType) {
      if (scheduledStart) {
        message += `\n\nStart Time: ${scheduledStart.toLocaleString()}`
      }
      if (scheduledEnd) {
        message += `\nEnd Time: ${scheduledEnd.toLocaleString()}`
      }

      await prisma.platformSettings.upsert({
        where: { id: "global" },
        update: { 
          scheduledMaintenanceStart: scheduledStart,
          scheduledMaintenanceEnd: scheduledEnd
        },
        create: { 
          id: "global", 
          isMaintenanceMode: false,
          scheduledMaintenanceStart: scheduledStart,
          scheduledMaintenanceEnd: scheduledEnd
        }
      });
      
      // Also log the scheduling
      await prisma.superAdminLog.create({
        data: {
          action: "MAINTENANCE_SCHEDULED",
          message: `Maintenance scheduled from ${scheduledStart?.toISOString()} to ${scheduledEnd?.toISOString() || "indefinitely"}.`
        }
      })
      revalidatePath("/", "layout");
    }

    // Fetch all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" }
    })

    if (admins.length === 0) {
      return { error: "No company admins found." }
    }

    if (sendInApp) {
      const notifications = admins.map((admin: any) => ({
        userId: admin.id,
        type: "SYSTEM",
        title: subject,
        message: message,
        isRead: false
      }))

      await prisma.notification.createMany({
        data: notifications
      })
    }

    if (sendEmail) {
      // Send emails concurrently
      await Promise.all(
        admins.map(async (admin: any) => {
          if (admin.email) {
            await sendBroadcastEmail(admin.email, subject, message)
          }
        })
      )
    }

    await prisma.superAdminLog.create({
      data: {
        action: "BROADCAST_SENT",
        message: `Broadcast "${subject}" sent to ${admins.length} admins. (Email: ${sendEmail}, In-App: ${sendInApp})`
      }
    })

    return { success: true, count: admins.length }
  } catch (error: any) {
    console.error("Failed to send broadcast:", error)
    return { error: error.message || "Failed to send broadcast." }
  }
}