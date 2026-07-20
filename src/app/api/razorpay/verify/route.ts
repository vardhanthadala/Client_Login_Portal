import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { sendClientInvoiceSuccessEmail, sendAdminInvoicePaidEmail } from "@/lib/mail"

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoiceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

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

    const tenant = invoice.clientProfile.tenant

    if (!tenant.razorpayKeySecret) {
      return NextResponse.json({ error: "Agency payment gateway not configured" }, { status: 400 })
    }

    const secret = decrypt(tenant.razorpayKeySecret)

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Signature is valid, update the invoice status
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
        },
        include: {
          clientProfile: {
            include: {
              user: true,
              tenant: {
                include: {
                  users: { where: { role: "ADMIN" } }
                }
              }
            }
          }
        }
      })
      
      // Send Emails
      const clientEmail = updatedInvoice.clientProfile.user.email
      const adminUsers = updatedInvoice.clientProfile.tenant?.users
      const adminEmail = adminUsers && adminUsers.length > 0 ? adminUsers[0].email : null
      const agencyName = updatedInvoice.clientProfile.tenant?.name || "Your Agency"
      
      const invoiceTitle = updatedInvoice.title
      const amountStr = `${updatedInvoice.currency} ${updatedInvoice.amount.toFixed(2)}`
      const clientName = updatedInvoice.clientProfile.clientName

      await sendClientInvoiceSuccessEmail(clientEmail, invoiceTitle, amountStr, agencyName, updatedInvoice.clientProfile.tenantId as string)
      
      if (adminEmail) {
        await sendAdminInvoicePaidEmail(adminEmail, invoiceTitle, amountStr, clientName)
      }
      
      return NextResponse.json({ success: true, message: "Payment verified successfully" })
    } else {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error verifying Razorpay payment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
