"use client"

import { useActionState, useState, useEffect } from "react"
import { loginAction, requestPasswordReset, verifyOtpAndResetPassword } from "@/app/actions/auth"
import { Loader2, Lock, Mail, Fingerprint } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Mode = "login" | "forgot" | "reset"

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login")
  
  // Login State
  const [loginState, loginActionDispatch, isLoginPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (loginState?.success) {
      window.location.href = "/login"
    }
  }, [loginState])
  
  // Forgot / Reset State
  const [resetEmail, setResetEmail] = useState("")
  const [isResetPending, setIsResetPending] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleForgotSubmit = async (formData: FormData) => {
    setIsResetPending(true)
    setResetError(null)
    
    const email = formData.get("email") as string
    const res = await requestPasswordReset(formData)
    
    setIsResetPending(false)
    if (res.error) {
      setResetError(res.error)
    } else {
      setResetEmail(email)
      setMode("reset")
    }
  }

  const handleResetSubmit = async (formData: FormData) => {
    setIsResetPending(true)
    setResetError(null)
    
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string
    
    if (newPassword !== confirmPassword) {
      setIsResetPending(false)
      setResetError("Passwords do not match")
      return
    }

    formData.append("email", resetEmail)
    const res = await verifyOtpAndResetPassword(formData)
    
    setIsResetPending(false)
    if (res.error) {
      setResetError(res.error)
    } else {
      setMode("login")
      setResetError("Password updated successfully! Please login.")
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-white px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative h-14 w-48">
            <Image 
              src="/images/logo.png" 
              alt="Dexze" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to Dexze
          </h1>
          {resetError === "Password updated successfully! Please login." && (
            <p className="text-green-600 text-sm font-medium">
              {resetError}
            </p>
          )}
        </div>

        {/* Form */}
        {mode === "login" && (
          <form action={loginActionDispatch} className="flex flex-col gap-5">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
                <span className="absolute left-3 text-gray-400 text-sm font-medium">@</span>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="Enter email to get started" 
                  required 
                  className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => setMode("forgot")} 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
                <Fingerprint size={16} className="absolute left-3 text-gray-400" />
                <input 
                  id="password" 
                  name="password"
                  type="password"
                  placeholder="Enter your password" 
                  required 
                  className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
                />
              </div>
            </div>

            {loginState?.error && (
              <p className="text-sm font-medium text-red-600">{loginState.error}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoginPending}
              className="mt-2 h-11 w-full bg-[#111827] hover:bg-[#1f2937] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isLoginPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form action={handleForgotSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
                <Mail size={16} className="absolute left-3 text-gray-400" />
                <input 
                  id="forgot-email" 
                  name="email"
                  type="email" 
                  placeholder="Enter email to get started" 
                  required 
                  disabled={isResetPending}
                  className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
                />
              </div>
            </div>

            {resetError && <p className="text-sm font-medium text-red-600">{resetError}</p>}

            <button 
              type="submit" 
              disabled={isResetPending}
              className="mt-2 h-11 w-full bg-[#111827] hover:bg-[#1f2937] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isResetPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send code"}
            </button>
            
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => setMode("login")} 
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form action={handleResetSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                6-digit code
              </label>
              <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
                <Lock size={16} className="absolute left-3 text-gray-400" />
                <input 
                  id="otp" 
                  name="otp"
                  type="text" 
                  placeholder="6-digit code" 
                  required 
                  maxLength={6}
                  disabled={isResetPending}
                  className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
                <Lock size={16} className="absolute left-3 text-gray-400" />
                <input 
                  id="newPassword" 
                  name="newPassword"
                  type="password"
                  placeholder="New password"
                  required 
                  minLength={8}
                  disabled={isResetPending}
                  className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
                <Lock size={16} className="absolute left-3 text-gray-400" />
                <input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  required 
                  minLength={8}
                  disabled={isResetPending}
                  className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
                />
              </div>
            </div>

            {resetError && <p className="text-sm font-medium text-red-600">{resetError}</p>}

            <button 
              type="submit" 
              disabled={isResetPending}
              className="mt-2 h-11 w-full bg-[#111827] hover:bg-[#1f2937] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isResetPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
            </button>

            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => setMode("login")} 
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 font-medium underline underline-offset-4">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
