import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { getToken } from "next-auth/jwt"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET, secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1", cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token" })
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const planId = process.env.RAZORPAY_PLAN_ID_MONTHLY
    if (!planId) {
      return NextResponse.json({ error: "Razorpay Plan ID not configured" }, { status: 500 })
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
      notes: {
        tenantId: token.tenantId as string,
        email: token.email as string
      }
    })

    return NextResponse.json({ subscriptionId: subscription.id })
  } catch (error: any) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 })
  }
}
