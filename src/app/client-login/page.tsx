"use client"

import { useActionState, useState, useEffect } from "react"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function ClientLoginPage() {
  const [loginState, loginActionDispatch, isLoginPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)

  // On successful login, redirect client-side (avoids NextAuth's broken NEXTAUTH_URL redirect)
  useEffect(() => {
    if (loginState?.success) {
      window.location.href = "/client-login"
    }
  }, [loginState])

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
            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-[#1E293B] mb-3 leading-[1.2] tracking-tight">
                Hello Welcome<br/>to <span className="text-[#10B981]">Dexze</span>
              </h1>
              <p className="text-[12px] text-[#64748B] font-medium leading-relaxed max-w-[240px]">
                Log in to view your projects, track progress, and securely access deliverables.
              </p>
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

              {loginState?.error && (
                <p className="text-[12px] font-bold text-red-500 text-center">{loginState.error}</p>
              )}
              
              <div className="flex flex-col gap-3 pt-2">
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
