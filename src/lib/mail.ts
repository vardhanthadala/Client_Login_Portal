import nodemailer from "nodemailer"

// Create a Nodemailer transporter using SMTP (Gmail in this case)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,     // e.g. vardhan.thadala23@gmail.com
    pass: process.env.SMTP_PASSWORD, // The 16-character App Password
  },
})

const ADMIN_EMAIL = process.env.SMTP_USER || "vardhan.thadala23@gmail.com"

export async function sendWelcomeEmail(toEmail: string, tempPassword: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASSWORD is not set. Skipping welcome email to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Welcome to Dexze! Your Client Portal Access",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #465fff;">Welcome to Dexze!</h1>
          <p>We are thrilled to start working with you. Your client portal is ready.</p>
          <p>You can access your personalized dashboard and begin the onboarding process here:</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Portal URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Your Email:</strong> ${toEmail}</p>
            <p style="margin: 0;"><strong>Your Password:</strong> <span style="font-family: monospace; font-size: 1.1em; color: #101828; font-weight: bold;">${tempPassword}</span></p>
          </div>
          
          <p>If you have any questions, please reply directly to this email.</p>
          <p>Best regards,<br>The Dexze Team</p>
        </div>
      `,
    })

    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendOnboardingCompleteEmail(clientName: string, companyName: string, aiSummary: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASSWORD is not set. Skipping onboarding complete email for ${companyName}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Portal" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🚨 Onboarding Complete: ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #465fff;">Client Onboarding Complete!</h1>
          <p><strong>${clientName}</strong> from <strong>${companyName}</strong> has just finished their onboarding wizard.</p>
          
          <h2 style="font-size: 1.2em; border-bottom: 1px solid #e4e7ec; padding-bottom: 8px; margin-top: 32px;">Gemini AI Extraction</h2>
          
          <div style="margin-top: 16px;">
            <h3 style="font-size: 1em; color: #101828;">Target Audience</h3>
            <p style="color: #667085;">${aiSummary?.targetAudience || "N/A"}</p>
          </div>
          
          <div style="margin-top: 16px;">
            <h3 style="font-size: 1em; color: #101828;">Brand Voice</h3>
            <p style="color: #667085;">${aiSummary?.brandVoice || "N/A"}</p>
          </div>
          
          <div style="margin-top: 16px;">
            <h3 style="font-size: 1em; color: #101828;">Marketing Angle</h3>
            <p style="color: #667085;">${aiSummary?.marketingAngle || "N/A"}</p>
          </div>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e7ec;">
            <a href="http://localhost:3000/admin/dashboard" style="display: inline-block; background-color: #465fff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Client Details</a>
          </div>
        </div>
      `,
    })

    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send onboarding complete email:", error)
    return { success: false, error: error.message }
  }
}
