import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant associated" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}));
    const planType = body.planType || "MONTHLY";

    // Select correct plan ID based on planType
    const isYearly = planType === "YEARLY";
    const planId = isYearly ? process.env.RAZORPAY_PLAN_ID_YEARLY : process.env.RAZORPAY_PLAN_ID_MONTHLY;
    
    if (!planId) {
      return NextResponse.json({ error: `Razorpay Plan ID not configured for ${planType}` }, { status: 500 })
    }
    
    // Create a subscription on Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: isYearly ? 10 : 120, // number of billing cycles (e.g., 10 years for yearly, 10 years for monthly)
      notes: {
        tenantId: tenantId
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: "Failed to create Razorpay subscription" }, { status: 500 })
    }

    // Save the subscription ID to the tenant
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { razorpaySubscriptionId: subscription.id }
    })

    return NextResponse.json({ 
      subscriptionId: subscription.id,
    })

  } catch (error) {
    console.error("Error creating Razorpay subscription:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
