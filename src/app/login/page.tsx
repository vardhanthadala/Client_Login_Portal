"use client"

import { useActionState, useState } from "react"
import { loginAction, requestPasswordReset, verifyOtpAndResetPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Mode = "login" | "forgot" | "reset"

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login")
  
  // Login State
  const [loginState, loginActionDispatch, isLoginPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)
  
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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden bg-[#F4F7FB]">
      <div className="relative z-10 w-full max-w-[480px] lg:max-w-[1000px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex overflow-hidden min-h-[600px]">
        
        {/* Left Side - Form Area */}
        <div className="w-full lg:w-1/2 p-10 sm:p-14 flex flex-col justify-center relative">
          
          {/* Logo */}
          <div className="absolute -top-2 left-10 sm:left-14 flex items-center gap-2">
            <div className="w-32 h-32 relative">
              <Image src="/images/logo.png" alt="Dexze" fill className="object-left object-contain" />
            </div>
          </div>

          <div className="mt-8 max-w-[340px]">
            {mode === "login" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[32px] font-bold text-[#1E293B] mb-3 leading-[1.2] tracking-tight">
                    Hello Welcome<br/>to <span className="text-[#10B981]">Dexze</span>
                  </h1>
                  <p className="text-[12px] text-[#64748B] font-medium leading-relaxed max-w-[240px]">
                    Let's manage your projects with<br/>our powerful Dexze portal
                  </p>
                  
                  {resetError === "Password updated successfully! Please login." && (
                    <p className="text-emerald-600 font-medium text-xs mt-4 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      {resetError}
                    </p>
                  )}
                </div>

                <form action={loginActionDispatch} className="space-y-6">
                  {/* Email Input */}
                  <div className="relative">
                    <label htmlFor="email" className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-[#1E293B] z-10">Email</label>
                    <div className="relative">
                      <input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        className="w-full bg-white border border-[#E2E8F0] text-[#1E293B] text-[13px] font-medium placeholder:text-[#CBD5E1] placeholder:font-normal focus-visible:ring-1 focus-visible:ring-[#10B981] focus-visible:border-[#10B981] h-[46px] rounded-xl pl-4 pr-10 outline-none transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[14px] font-semibold">
                        @
                      </div>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <label htmlFor="password" className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-[#1E293B] z-10">Password</label>
                    <div className="relative">
                      <input 
                        id="password" 
                        name="password"
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        required 
                        className="w-full bg-white border border-[#E2E8F0] text-[#1E293B] text-[16px] font-medium placeholder:text-[#CBD5E1] placeholder:font-normal focus-visible:ring-1 focus-visible:ring-[#10B981] focus-visible:border-[#10B981] h-[46px] rounded-xl pl-4 pr-10 outline-none transition-all tracking-[0.2em]"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] transition-colors outline-none flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-[14px] h-[14px]" />
                        ) : (
                          <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1 pb-1">
                    <button 
                      type="button" 
                      onClick={() => { setMode("forgot"); setResetError(null); }}
                      className="text-[11px] font-bold text-[#94A3B8] hover:text-[#10B981] transition-colors"
                    >
                      Forgot Password
                    </button>
                  </div>

                  {loginState?.error && (
                    <p className="text-[12px] font-bold text-red-500 text-center">{loginState.error}</p>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#10B981] hover:bg-[#059669] text-white h-[46px] rounded-xl text-[13px] font-bold transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)]" 
                      disabled={isLoginPending}
                    >
                      {isLoginPending ? (
                        <Loader2 className="mr-2 h-[16px] w-[16px] animate-spin" />
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {mode === "forgot" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[32px] font-bold text-[#1E293B] mb-3 leading-[1.2] tracking-tight">
                    Forgot Password
                  </h1>
                  <p className="text-[12px] text-[#64748B] font-medium leading-relaxed max-w-[240px]">
                    Enter your email to receive a code.
                  </p>
                </div>

                <form action={handleForgotSubmit} className="space-y-6">
                  <div className="relative">
                    <label htmlFor="forgot-email" className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-[#1E293B] z-10">Email</label>
                    <div className="relative">
                      <input 
                        id="forgot-email" 
                        name="email"
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        disabled={isResetPending}
                        className="w-full bg-white border border-[#E2E8F0] text-[#1E293B] text-[13px] font-medium placeholder:text-[#CBD5E1] placeholder:font-normal focus-visible:ring-1 focus-visible:ring-[#F97316] focus-visible:border-[#F97316] h-[46px] rounded-xl pl-4 pr-10 outline-none transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[14px] font-semibold">@</div>
                    </div>
                  </div>
                  
                  {resetError && (
                    <p className="text-[12px] font-bold text-red-500 text-center">{resetError}</p>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#FBA94C] hover:bg-[#F97316] text-white h-[46px] rounded-xl text-[13px] font-bold transition-all shadow-[0_4px_14px_rgba(249,115,22,0.3)]" 
                      disabled={isResetPending}
                    >
                      {isResetPending ? <Loader2 className="h-[16px] w-[16px] animate-spin" /> : "Send Code"}
                    </Button>
                    <button 
                      type="button" 
                      onClick={() => { setMode("login"); setResetError(null); }}
                      className="text-center text-[11px] font-bold text-[#94A3B8] hover:text-[#F97316] pt-2 transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </>
            )}

            {mode === "reset" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[32px] font-bold text-[#1E293B] mb-3 leading-[1.2] tracking-tight">
                    Reset Password
                  </h1>
                  <p className="text-[12px] text-[#64748B] font-medium leading-relaxed max-w-[240px]">
                    Enter your code and new password.
                  </p>
                </div>

                <form action={handleResetSubmit} className="space-y-6">
                  <div className="relative">
                    <label htmlFor="otp" className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-[#1E293B] z-10">6-Digit Code</label>
                    <input 
                      id="otp" 
                      name="otp"
                      type="text" 
                      placeholder="123456" 
                      required 
                      maxLength={6}
                      disabled={isResetPending}
                      className="w-full bg-white border border-[#E2E8F0] text-[#1E293B] text-[16px] font-bold tracking-widest text-center placeholder:text-[#CBD5E1] placeholder:font-normal focus-visible:ring-1 focus-visible:ring-[#F97316] focus-visible:border-[#F97316] h-[46px] rounded-xl px-4 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="newPassword" className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-[#1E293B] z-10">New Password</label>
                    <div className="relative">
                      <input 
                        id="newPassword" 
                        name="newPassword"
                        type={showPassword ? "text" : "password"} 
                        required 
                        minLength={8}
                        disabled={isResetPending}
                        className="w-full bg-white border border-[#E2E8F0] text-[#1E293B] text-[16px] font-medium placeholder:text-[#CBD5E1] placeholder:font-normal focus-visible:ring-1 focus-visible:ring-[#F97316] focus-visible:border-[#F97316] h-[46px] rounded-xl pl-4 pr-10 outline-none transition-all tracking-[0.2em]"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] transition-colors outline-none flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isResetPending}
                      >
                        {showPassword ? <EyeOff className="w-[14px] h-[14px]" /> : <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-bold text-[#1E293B] z-10">Confirm Password</label>
                    <div className="relative">
                      <input 
                        id="confirmPassword" 
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"} 
                        required 
                        minLength={8}
                        disabled={isResetPending}
                        className="w-full bg-white border border-[#E2E8F0] text-[#1E293B] text-[16px] font-medium placeholder:text-[#CBD5E1] placeholder:font-normal focus-visible:ring-1 focus-visible:ring-[#F97316] focus-visible:border-[#F97316] h-[46px] rounded-xl pl-4 pr-10 outline-none transition-all tracking-[0.2em]"
                      />
                    </div>
                  </div>
                  
                  {resetError && (
                    <p className="text-[12px] font-bold text-red-500 text-center">{resetError}</p>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#FBA94C] hover:bg-[#F97316] text-white h-[46px] rounded-xl text-[13px] font-bold transition-all shadow-[0_4px_14px_rgba(249,115,22,0.3)]" 
                      disabled={isResetPending}
                    >
                      {isResetPending ? <Loader2 className="h-[16px] w-[16px] animate-spin" /> : "Reset Password"}
                    </Button>
                    <button 
                      type="button" 
                      onClick={() => { setMode("login"); setResetError(null); }}
                      className="text-center text-[11px] font-bold text-[#94A3B8] hover:text-[#F97316] pt-2 transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Image Area */}
        <div className="hidden lg:block w-1/2 relative bg-white">
          <div className="absolute inset-0 z-0">
             <Image src="/images/login-illustration-v3.png" alt="Illustration" fill className="object-cover object-center" priority />
          </div>
        </div>
        
      </div>
    </div>
  )
}
