import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
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
      return NextResponse.json({ error: "Unauthorized" },
    secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token", { status: 401 })
    }

    const { invoiceId } = await req.json()
    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })
    }

    // Verify invoice belongs to this user or admin, and fetch tenant
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        clientProfile: {
          include: {
            tenant: true
          }
        } 
      }
    })

    if (!invoice || !invoice.clientProfile || !invoice.clientProfile.tenant) {
      return NextResponse.json({ error: "Invoice or tenant not found" }, { status: 404 })
    }

    if (token.role === "CLIENT" && invoice.clientProfile.userId !== token.id) {
      return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 401 })
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 })
    }

    const tenant = invoice.clientProfile.tenant
    
    if (!tenant.razorpayKeyId || !tenant.razorpayKeySecret) {
      return NextResponse.json({ error: "Agency payment gateway not configured. Please contact your agency." }, { status: 400 })
    }

    const decryptedSecret = decrypt(tenant.razorpayKeySecret)

    // Instantiate Razorpay dynamically with Tenant's keys
    const razorpay = new Razorpay({
      key_id: tenant.razorpayKeyId,
      key_secret: decryptedSecret,
    })

    // If order already exists, return it (to avoid creating duplicates if client clicks pay multiple times)
    if (invoice.razorpayOrderId) {
      return NextResponse.json({ 
        orderId: invoice.razorpayOrderId, 
        amount: invoice.amount * 100, // Razorpay expects subunits
        currency: invoice.currency,
        razorpayKeyId: tenant.razorpayKeyId // Pass the tenant's key ID to the frontend
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
      currency: options.currency,
      razorpayKeyId: tenant.razorpayKeyId // Pass the tenant's key ID to the frontend
    })

  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
