import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function POST(req: NextRequest) {
  try {
    const isSecure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
      secureCookie: isSecure,
      cookieName: isSecure ? "__Secure-authjs.session-token" : "authjs.session-token"
    })
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planType } = body

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify Razorpay signature
    const text = razorpay_payment_id + "|" + razorpay_subscription_id
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
                                    .update(text)
                                    .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update Tenant
    await prisma.tenant.update({
      where: { id: token.tenantId as string },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: planType === "YEARLY" ? "PREMIUM_YEARLY" : "PREMIUM",
        razorpaySubscriptionId: razorpay_subscription_id
      }
    })

    return NextResponse.json({ success: true, message: "Subscription verified successfully" })
  } catch (error: any) {
    console.error("Error verifying subscription:", error)
    return NextResponse.json({ error: error.message || "Failed to verify subscription" }, { status: 500 })
  }
}
