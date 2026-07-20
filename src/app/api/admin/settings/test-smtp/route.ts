import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { decrypt } from "@/lib/encryption"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN" || !session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPassword: true,
        smtpFrom: true,
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    if (!tenant.smtpHost || !tenant.smtpPort || !tenant.smtpUser || !tenant.smtpPassword) {
      return NextResponse.json({ error: "SMTP settings are incomplete" }, { status: 400 })
    }

    const decryptedPassword = decrypt(tenant.smtpPassword)

    const transporter = nodemailer.createTransport({
      host: tenant.smtpHost,
      port: tenant.smtpPort,
      secure: tenant.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: tenant.smtpUser,
        pass: decryptedPassword,
      },
    })

    // Send a test email to the admin who is currently logged in
    await transporter.sendMail({
      from: tenant.smtpFrom || `"${tenant.smtpUser}" <${tenant.smtpUser}>`,
      to: session.user.email as string,
      subject: "SMTP Test Connection Successful",
      text: "Your SMTP settings have been configured successfully!",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">SMTP Connection Successful</h2>
          <p>This is an automated test email confirming that your custom SMTP settings in the portal are working perfectly.</p>
          <p>You can now send emails to your clients using your own domain.</p>
        </div>
      `
    })

    return NextResponse.json({ success: true, message: "Test email sent successfully" })
  } catch (error: any) {
    console.error("Error testing SMTP settings:", error)
    return NextResponse.json({ error: error.message || "Failed to send test email" }, { status: 500 })
  }
}
