import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

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
      const tenantId = subscription.notes?.tenantId

      if (tenantId) {
        // Calculate next billing cycle (simplified: assume 1 month added from now or from end charge)
        const currentEnd = new Date(subscription.current_end * 1000)
        
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: "ACTIVE",
            subscriptionEnd: currentEnd
          }
        })
      }
    } else if (event.event === "subscription.halted" || event.event === "subscription.cancelled") {
      const subscription = event.payload.subscription.entity
      const tenantId = subscription.notes?.tenantId

      if (tenantId) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: "EXPIRED"
          }
        })
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
