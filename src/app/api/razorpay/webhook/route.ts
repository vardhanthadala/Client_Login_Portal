import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendAdminSubscriptionSuccessEmail, sendAdminSubscriptionFailureEmail, sendSuperadminNewSubscriberEmail } from "@/lib/mail"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Handle subscription events
    if (event.event === "subscription.charged") {
      const subscription = event.payload.subscription.entity
      let tenantId = subscription.notes?.tenantId

      if (!tenantId) {
        // Try to find tenant by subscription ID (useful for onboarding flow where tenant isn't created until after payment)
        const existingTenant = await prisma.tenant.findFirst({
          where: { razorpaySubscriptionId: subscription.id }
        })
        if (existingTenant) {
          tenantId = existingTenant.id
        }
      }

      if (tenantId) {
        // Calculate next billing cycle (simplified: assume 1 month added from now or from end charge)
        const currentEnd = new Date(subscription.current_end * 1000)
        
        const tenant = await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: "ACTIVE",
            subscriptionEnd: currentEnd
          },
          include: {
            users: { where: { role: "ADMIN" } }
          }
        })
        
        const planName = tenant.subscriptionPlan
        const amount = subscription.notes?.amount ? `₹${(parseInt(subscription.notes.amount) / 100).toFixed(2)}` : "₹5000.00"

        // Send success email to Admin
        let adminEmail = "Unknown Admin"
        let adminName = "Admin"
        if (tenant.users.length > 0) {
          adminEmail = tenant.users[0].email
          adminName = tenant.users[0].name || "Admin"
          await sendAdminSubscriptionSuccessEmail(adminEmail, planName, amount, adminName)
        }

        // Notify Superadmin
        const superadmins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN" } })
        for (const superadmin of superadmins) {
          await sendSuperadminNewSubscriberEmail(superadmin.email, tenant.name, adminEmail, planName, amount)
        }
      }
    } else if (event.event === "subscription.halted" || event.event === "subscription.cancelled") {
      const subscription = event.payload.subscription.entity
      let tenantId = subscription.notes?.tenantId

      if (!tenantId) {
        const existingTenant = await prisma.tenant.findFirst({
          where: { razorpaySubscriptionId: subscription.id }
        })
        if (existingTenant) {
          tenantId = existingTenant.id
        }
      }

      if (tenantId) {
        const tenant = await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: "EXPIRED"
          },
          include: {
            users: { where: { role: "ADMIN" } }
          }
        })
        
        // Send failure email to Admin
        if (tenant.users.length > 0) {
          const adminEmail = tenant.users[0].email
          const adminName = tenant.users[0].name || "Admin"
          const planName = tenant.subscriptionPlan
          await sendAdminSubscriptionFailureEmail(adminEmail, planName, adminName)
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
