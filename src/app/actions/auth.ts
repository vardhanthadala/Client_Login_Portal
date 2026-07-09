"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function loginAction(prevState: any, formData: FormData) {
  let isSuccess = false
  try {
    await signIn("credentials", Object.fromEntries(formData))
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    
    // Check if the error is a Next.js redirect error thrown by Auth.js
    if (error && typeof error === 'object' && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
      isSuccess = true
    } else {
      throw error
    }
  }

  if (isSuccess) {
    // Force a native relative redirect. Since the user is now logged in,
    // proxy.ts will intercept this and route them to the correct dashboard.
    redirect("/login")
  }
}

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"

async function getAuthSession() {
  const reqCookies = await cookies()
  const reqHeaders = await headers()
  
  const req = {
    cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
    headers: Object.fromEntries(reqHeaders.entries())
  } as any

  return getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
}

import { sendPasswordResetOTP } from "@/lib/mail"

export async function requestPasswordReset(formData: FormData) {
  try {
    const email = formData.get("email") as string
    if (!email) return { error: "Email is required" }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { success: true } 
    }

    if (user.role === "CLIENT") {
      return { error: "Clients cannot reset passwords. Please contact your company administrator." }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Expires in 15 mins
    const expiry = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, resetOtpExpiry: expiry }
    })

    await sendPasswordResetOTP(email, otp)
    return { success: true }
  } catch (error) {
    console.error("Failed to request password reset:", error)
    return { error: "Something went wrong" }
  }
}

export async function verifyOtpAndResetPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const otp = formData.get("otp") as string
    const newPassword = formData.get("newPassword") as string
    
    if (!email || !otp || !newPassword) return { error: "Missing required fields" }
    if (newPassword.length < 8) return { error: "Password must be at least 8 characters" }

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return { error: "Invalid or expired OTP" }
    }

    if (user.resetOtp !== otp) {
      return { error: "Incorrect OTP" }
    }

    if (new Date() > user.resetOtpExpiry) {
      return { error: "OTP has expired" }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        resetOtp: null,
        resetOtpExpiry: null
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to reset password:", error)
    return { error: "Failed to reset password" }
  }
}
