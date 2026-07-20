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

export async function sendWelcomeEmail(toEmail: string, tempPassword: string, agencyName: string = "Our Platform", adminName: string = "Admin") {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASSWORD is not set. Skipping welcome email to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"${agencyName} Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Welcome to ${agencyName}! Your Admin Access`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #465fff;">Welcome to ${agencyName}!</h1>
          <p>Hi ${adminName},</p>
          <p>We are thrilled to have you on board. Your company workspace is ready.</p>
          <p>You can access your new admin dashboard and begin managing your clients here:</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Portal URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Your Email:</strong> ${toEmail}</p>
            <p style="margin: 0;"><strong>Your Password:</strong> <span style="font-family: monospace; font-size: 1.1em; color: #101828; font-weight: bold;">${tempPassword}</span></p>
          </div>
          
          <h2 style="font-size: 1.2em; border-bottom: 1px solid #e4e7ec; padding-bottom: 8px; margin-top: 32px;">🚀 Next Steps: Complete Your Setup</h2>
          <p>Before you invite your clients, please log in and navigate to your <strong>Settings</strong> page to configure your integrations:</p>
          <ul style="padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;"><strong>Payment Gateway (Razorpay):</strong> Add your Razorpay Key ID and Secret so you can receive payments directly from your clients into your own bank account.</li>
            <li style="margin-bottom: 8px;"><strong>AWS S3 Storage (BYOS):</strong> Add your AWS S3 bucket credentials so that all files and brand assets uploaded by your clients are stored securely in your private cloud infrastructure.</li>
          </ul>
          
          <p style="margin-top: 24px;">If you have any questions, please reply directly to this email.</p>
          <p>Best regards,<br>The ${agencyName} Team</p>
        </div>
      `,
    })

    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendOnboardingCompleteEmail(toEmail: string, clientName: string, companyName: string, aiSummary: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASSWORD is not set. Skipping onboarding complete email for ${companyName}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
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

export async function sendPasswordResetOTP(toEmail: string, otp: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASSWORD is not set. Skipping OTP email to ${toEmail}.`)
    console.log(`\n==============================================`)
    console.log(`🔑 DEV LOG: OTP REQUESTED`)
    console.log(`Email: ${toEmail}`)
    console.log(`OTP: ${otp}`)
    console.log(`==============================================\n`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Security" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Your Password Reset Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password. Here is your 6-digit confirmation code:</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <span style="font-family: monospace; font-size: 2em; color: #5A52FF; font-weight: bold; letter-spacing: 4px;">${otp}</span>
          </div>
          
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
        </div>
      `,
    })

    console.log(`\n==============================================`)
    console.log(`🔑 DEV LOG: OTP SENT`)
    console.log(`Email: ${toEmail}`)
    console.log(`OTP: ${otp}`)
    console.log(`==============================================\n`)

    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send OTP email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendClientPasswordResetEmail(toEmail: string, newPassword: string, agencyName: string = "Our Platform") {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASSWORD is not set. Skipping client password reset email to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"${agencyName} Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Your ${agencyName} password has been reset`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #465fff;">Password Updated</h1>
          <p>Your company administrator has reset the password for your client portal.</p>
          <p>You can access your dashboard using your new credentials below:</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Portal URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Your Email:</strong> ${toEmail}</p>
            <p style="margin: 0;"><strong>New Password:</strong> <span style="font-family: monospace; font-size: 1.1em; color: #101828; font-weight: bold;">${newPassword}</span></p>
          </div>
          
          <p>If you have any questions or if you didn't request this, please reply directly to this email to contact your company.</p>
          <p>Best regards,<br>The ${agencyName} Team</p>
        </div>
      `,
    })

    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send client password reset email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendAdminSubscriptionSuccessEmail(toEmail: string, planName: string, amount: string, adminName: string = "Admin") {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP missing. Skipping subscription success email to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Billing" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Payment Successful - ${planName} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Payment Successful! 🎉</h1>
          <p>Hi ${adminName},</p>
          <p>We've successfully processed your subscription payment for the Dexze platform.</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Amount:</strong> ${amount}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="color: #10B981; font-weight: bold;">Active</span></p>
          </div>
          
          <p>Your workspace is fully active and ready to go.</p>
          <p>Thank you for choosing Dexze!</p>
        </div>
      `,
    })
    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send subscription success email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendAdminSubscriptionFailureEmail(toEmail: string, planName: string, adminName: string = "Admin") {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP missing. Skipping subscription failure email to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Billing" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Action Required: Payment Failed for ${planName} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #EF4444;">Payment Failed ⚠️</h1>
          <p>Hi ${adminName},</p>
          <p>We were unable to process the renewal payment for your Dexze workspace subscription.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #991b1b;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 0; color: #991b1b;">Please update your payment method in the Billing section to keep your workspace active and prevent any disruption for your clients.</p>
          </div>
          
          <a href="http://localhost:3000/admin/billing" style="display: inline-block; background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Update Payment Method</a>
        </div>
      `,
    })
    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send subscription failure email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendClientInvoiceSuccessEmail(toEmail: string, invoiceTitle: string, amount: string, agencyName: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP missing. Skipping client invoice success email to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"${agencyName} Billing" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Payment Receipt: ${invoiceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Payment Received!</h1>
          <p>Thank you for your payment. This email serves as your receipt.</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Invoice:</strong> ${invoiceTitle}</p>
            <p style="margin: 0 0 8px 0;"><strong>Amount Paid:</strong> ${amount}</p>
            <p style="margin: 0;"><strong>Paid To:</strong> ${agencyName}</p>
          </div>
          
          <p>You can view your full invoice history anytime in your client portal.</p>
          <a href="http://localhost:3000/client/invoices" style="display: inline-block; background-color: #465fff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View Invoices</a>
        </div>
      `,
    })
    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send client invoice success email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendAdminInvoicePaidEmail(toEmail: string, invoiceTitle: string, amount: string, clientName: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP missing. Skipping admin invoice paid email to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Notifications" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `💰 Invoice Paid: ${invoiceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">You Got Paid! 💸</h1>
          <p>Great news! <strong>${clientName}</strong> has just paid an invoice.</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Client:</strong> ${clientName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Invoice:</strong> ${invoiceTitle}</p>
            <p style="margin: 0;"><strong>Amount Collected:</strong> <span style="color: #10B981; font-weight: bold;">${amount}</span></p>
          </div>
          
          <a href="http://localhost:3000/admin/dashboard" style="display: inline-block; background-color: #465fff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
        </div>
      `,
    })
    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send admin invoice paid email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendSuperadminNewSubscriberEmail(toEmail: string, agencyName: string, adminEmail: string, planName: string, amount: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP missing. Skipping superadmin notification to ${toEmail}.`)
    return { success: false, error: "SMTP credentials not set." }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dexze System" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🚨 New Subscription Payment: ${agencyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #465fff;">New Platform Revenue! 📈</h1>
          <p>A company has successfully paid their platform subscription fee.</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Company:</strong> ${agencyName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Admin Email:</strong> ${adminEmail}</p>
            <p style="margin: 0 0 8px 0;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 0;"><strong>Amount Collected:</strong> <span style="color: #10B981; font-weight: bold;">${amount}</span></p>
          </div>
        </div>
      `,
    })
    return { success: true, data: info.messageId }
  } catch (error: any) {
    console.error("Failed to send superadmin notification:", error)
    return { success: false, error: error.message }
  }
}



export async function sendInvoiceReminderEmail(toEmail: string, clientName: string, invoiceTitle: string, amount: number, currency: string, dueDateStr: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP credentials not set. Skipping reminder for ${invoiceTitle}.`);
    return { success: false, error: "SMTP credentials not set." };
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"Agency Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Action Required: Overdue Invoice - ${invoiceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Overdue Invoice Notice</h1>
          <p>Hi ${clientName},</p>
          <p>This is a friendly reminder that your invoice <strong>${invoiceTitle}</strong> is currently overdue.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Amount Due:</strong> ${currency} ${amount.toFixed(2)}</p>
            <p style="margin: 0;"><strong>Due Date:</strong> ${dueDateStr}</p>
          </div>
          
          <p>Please log in to your portal to review and pay this invoice as soon as possible to avoid any disruption to your services.</p>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e7ec;">
            <a href="http://localhost:3000/login" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View & Pay Invoice</a>
          </div>
          <p style="margin-top: 24px;">If you have already paid this invoice, please disregard this notice.</p>
        </div>
      `
    });
    return { success: true, data: info.messageId };
  } catch (error: any) {
    console.error("Failed to send reminder email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendBroadcastEmail(toEmail: string, subject: string, message: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[MAILER] SMTP credentials not set. Skipping broadcast to ${toEmail}.`);
    return { success: false, error: "SMTP credentials not set." };
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"Dexze SuperAdmin" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #101828; margin-bottom: 24px;">Platform Announcement</h2>
          <div style="background-color: #f9fafb; border: 1px solid #e4e7ec; border-radius: 8px; padding: 20px; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <p style="margin-top: 24px; font-size: 14px; color: #667085;">You are receiving this email because you are a registered administrator on the platform.</p>
        </div>
      `
    });
    return { success: true, data: info.messageId };
  } catch (error: any) {
    console.error("Failed to send broadcast email:", error);
    return { success: false, error: error.message };
  }
}

