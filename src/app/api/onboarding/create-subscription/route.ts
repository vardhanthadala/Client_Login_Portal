import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { prisma } from "@/lib/prisma"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { email, agencyName } = await req.json()

    if (!email || !agencyName) {
      return NextResponse.json({ error: "Email and Agency Name are required" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 400 })
    }

    const planId = process.env.RAZORPAY_PLAN_ID
    if (!planId) {
      return NextResponse.json({ error: "Razorpay Plan ID not configured" }, { status: 500 })
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
      notes: {
        email,
        agencyName
      }
    })

    return NextResponse.json({ subscriptionId: subscription.id })
  } catch (error: any) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 })
  }
}
