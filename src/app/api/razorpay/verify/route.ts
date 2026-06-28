import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoiceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Signature is valid, update the invoice status
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
        }
      })
      return NextResponse.json({ success: true, message: "Payment verified successfully" })
    } else {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error verifying Razorpay payment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
