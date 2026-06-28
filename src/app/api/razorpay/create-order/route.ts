import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

import { cookies, headers } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const reqCookies = await cookies()
    const reqHeaders = await headers()
    
    const mockReq = {
      cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
      headers: Object.fromEntries(reqHeaders.entries())
    } as any

    const token = await getToken({ req: mockReq, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { invoiceId } = await req.json()
    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })
    }

    // Verify invoice belongs to this user or admin
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { clientProfile: true }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (token.role === "CLIENT" && invoice.clientProfile.userId !== token.id) {
      return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 401 })
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 })
    }

    // If order already exists, return it (to avoid creating duplicates if client clicks pay multiple times)
    if (invoice.razorpayOrderId) {
      // You could optionally verify the order status with Razorpay here
      return NextResponse.json({ 
        orderId: invoice.razorpayOrderId, 
        amount: invoice.amount * 100, // Razorpay expects subunits
        currency: invoice.currency
      })
    }

    // Create a new Razorpay Order
    const options = {
      amount: Math.round(invoice.amount * 100), // amount in the smallest currency unit
      currency: invoice.currency,
      receipt: `receipt_${invoice.id.substring(0, 30)}`,
    }

    const order = await razorpay.orders.create(options)

    if (!order) {
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 })
    }

    // Save order ID to database
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { razorpayOrderId: order.id }
    })

    return NextResponse.json({ 
      orderId: order.id, 
      amount: options.amount,
      currency: options.currency
    })

  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
