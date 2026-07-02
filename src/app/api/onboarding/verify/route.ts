import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/mail"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, email, agencyName } = body

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !email || !agencyName) {
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // In a real app, you might want to link them or error out
      return NextResponse.json({ error: "Email already in use. Please contact support." }, { status: 400 })
    }

    // Generate random secure password
    const tempPassword = crypto.randomBytes(6).toString("hex") // 12 character hex string
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    // Create Tenant and User transactionally
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: agencyName,
          subscriptionPlan: "PREMIUM",
          subscriptionStatus: "ACTIVE",
          razorpaySubscriptionId: razorpay_subscription_id,
        }
      })

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "ADMIN",
          mustChangePassword: true,
          tenantId: tenant.id
        }
      })

      return { tenant, user }
    })

    // Send email to new admin
    const emailResult = await sendWelcomeEmail(email, tempPassword, agencyName)
    
    console.log(`\n==============================================`)
    console.log(`🔑 DEV LOG: NEW ACCOUNT CREATED`)
    console.log(`Email: ${email}`)
    console.log(`Temp Password: ${tempPassword}`)
    if (!emailResult.success) {
      console.log(`⚠️ WARNING: Welcome Email failed to send!`)
      console.error(emailResult.error)
    } else {
      console.log(`✅ Welcome Email sent to Google SMTP`)
    }
    console.log(`==============================================\n`)

    return NextResponse.json({ success: true, message: "Account created successfully" })
  } catch (error: any) {
    console.error("Error verifying subscription:", error)
    return NextResponse.json({ error: error.message || "Failed to verify subscription" }, { status: 500 })
  }
}
