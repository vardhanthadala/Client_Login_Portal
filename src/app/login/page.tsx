"use client"

import { useActionState, useState, useEffect } from "react"
import { loginAction, requestPasswordReset, verifyOtpAndResetPassword } from "@/app/actions/auth"
import { Loader2, User, Lock, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Mode = "login" | "forgot" | "reset"

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login")
  
  // Login State
  const [loginState, loginActionDispatch, isLoginPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)

  // On successful login, redirect client-side (avoids NextAuth's broken NEXTAUTH_URL redirect)
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
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-[#2D2A6E]">
      
      {/* Complex Vector Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1920 1080">
          <defs>
            {/* Sky Gradient */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#301A6A" />
              <stop offset="50%" stopColor="#554B86" />
              <stop offset="100%" stopColor="#7F81A3" />
            </linearGradient>
            
            {/* Lake Overlay Gradient */}
            <linearGradient id="lakeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7F94B0" />
              <stop offset="100%" stopColor="#4A457D" stopOpacity="0.8" />
            </linearGradient>

            {/* Reflections Gradient Overlay */}
            <linearGradient id="reflectionOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#41416E" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#93ADC9" stopOpacity="0.9"/>
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="1920" height="1080" fill="url(#skyGrad)" />

          {/* Stars */}
          <g fill="#FFF" opacity="0.8">
            <circle cx="150" cy="150" r="1.5" />
            <circle cx="450" cy="120" r="1.5" />
            <circle cx="850" cy="80" r="2" />
            <circle cx="1200" cy="200" r="1.5" />
            <circle cx="1600" cy="150" r="1" />
            <circle cx="300" cy="300" r="2" />
            <circle cx="700" cy="250" r="1" />
            <circle cx="1000" cy="180" r="1.5" />
            <circle cx="1400" cy="280" r="1.5" />
            <circle cx="1700" cy="90" r="2" />
            <circle cx="1800" cy="300" r="1" />
            <circle cx="100" cy="400" r="1.5" />
          </g>

          {/* Moon */}
          <circle cx="500" cy="350" r="100" fill="#F4F4F6" filter="drop-shadow(0 0 20px rgba(255,255,255,0.4))" />
          


          {/* Background Mountains */}
          <path d="M0 650 L150 550 L300 620 L500 480 L650 580 L900 450 L1200 600 L1500 350 L1920 650 L1920 1080 L0 1080 Z" fill="#4B3D7B" opacity="0.6" />
          
          {/* Midground Mountains */}
          <path d="M0 720 L250 580 L400 650 L600 520 L800 680 L1100 450 L1400 620 L1700 480 L1920 700 L1920 1080 L0 1080 Z" fill="#46427D" opacity="0.8" />
          
          {/* Foreground Mountains */}
          <path d="M0 780 L300 620 L450 720 L750 480 L950 680 L1300 550 L1600 700 L1920 650 L1920 1080 L0 1080 Z" fill="#3D3B6A" opacity="0.9" />

          {/* Horizon Line / Water Level */}
          <rect y="750" width="1920" height="330" fill="url(#lakeGrad)" />

          {/* Reflections (Mirrored and Flattened) */}
          <g transform="translate(0, 1500) scale(1, -1) scale(1, 0.4)" opacity="0.3">
            <path d="M0 650 L150 550 L300 620 L500 480 L650 580 L900 450 L1200 600 L1500 350 L1920 650 L1920 1080 L0 1080 Z" fill="#4B3D7B" />
            <path d="M0 720 L250 580 L400 650 L600 520 L800 680 L1100 450 L1400 620 L1700 480 L1920 700 L1920 1080 L0 1080 Z" fill="#46427D" />
            <path d="M0 780 L300 620 L450 720 L750 480 L950 680 L1300 550 L1600 700 L1920 650 L1920 1080 L0 1080 Z" fill="#3D3B6A" />
            <circle cx="500" cy="350" r="100" fill="#FFFFFF" />
          </g>

          {/* Lake Overlay to soften reflection */}
          <rect y="750" width="1920" height="330" fill="url(#reflectionOverlay)" style={{ mixBlendMode: 'overlay' }} />
          

          {/* Trees Line (On the horizon) */}
          <g fill="#17343A">
            {/* Left cluster */}
            <polygon points="40,750 60,650 80,750" />
            <polygon points="70,750 90,680 110,750" />
            <polygon points="130,750 150,630 170,750" />
            <polygon points="160,750 180,670 200,750" />
            <polygon points="230,750 250,660 270,750" />
            <polygon points="300,750 320,690 340,750" />
            {/* Middle cluster */}
            <polygon points="730,750 745,680 760,750" />
            <polygon points="800,750 815,670 830,750" />
            <polygon points="850,750 865,660 880,750" />
            <polygon points="890,750 905,680 920,750" />
            <polygon points="930,750 945,670 960,750" />
            <polygon points="980,750 995,680 1010,750" />
            {/* Right cluster */}
            <polygon points="1440,750 1460,670 1480,750" />
            <polygon points="1500,750 1520,650 1540,750" />
            <polygon points="1670,750 1690,660 1710,750" />
            <polygon points="1720,750 1740,630 1760,750" />
            <polygon points="1750,750 1770,680 1790,750" />
            <polygon points="1860,750 1880,640 1900,750" />
            <polygon points="1890,750 1910,670 1930,750" />
          </g>

          {/* Tree Reflections */}
          <g fill="#17343A" transform="translate(0, 1500) scale(1, -1)" opacity="0.4">
             {/* Left cluster */}
             <polygon points="40,750 60,650 80,750" />
            <polygon points="70,750 90,680 110,750" />
            <polygon points="130,750 150,630 170,750" />
            <polygon points="160,750 180,670 200,750" />
            <polygon points="230,750 250,660 270,750" />
            <polygon points="300,750 320,690 340,750" />
            {/* Middle cluster */}
            <polygon points="730,750 745,680 760,750" />
            <polygon points="800,750 815,670 830,750" />
            <polygon points="850,750 865,660 880,750" />
            <polygon points="890,750 905,680 920,750" />
            <polygon points="930,750 945,670 960,750" />
            <polygon points="980,750 995,680 1010,750" />
            {/* Right cluster */}
            <polygon points="1440,750 1460,670 1480,750" />
            <polygon points="1500,750 1520,650 1540,750" />
            <polygon points="1670,750 1690,660 1710,750" />
            <polygon points="1720,750 1740,630 1760,750" />
            <polygon points="1750,750 1770,680 1790,750" />
            <polygon points="1860,750 1880,640 1900,750" />
            <polygon points="1890,750 1910,670 1930,750" />
          </g>
        </svg>
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full p-8 flex items-center gap-12 z-20">
        <div className="w-48 h-16 relative">
          <Image src="/images/logo.png" alt="Dexze" fill className="object-contain" />
        </div>

      </nav>

      {/* Login Card Container */}
      <div className="relative z-10 w-full h-screen md:h-auto flex items-center justify-end md:justify-end px-4 md:px-[15%] lg:px-[20%] mt-12 md:mt-0">
        <div 
          className="w-full max-w-[440px] rounded-[24px] overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Inner Light Reflection (Top) */}
          <div className="absolute top-0 left-0 w-full h-[35%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-[24px]"></div>

          <div className="px-10 pt-20 pb-12 relative z-10">
            {/* Header Text */}
            <div className="flex flex-col mb-10">
              <h1 
                className="text-[54px] font-semibold text-white leading-none tracking-tighter"
                style={{ fontFamily: "'Oswald', 'Bebas Neue', Impact, sans-serif", transform: "scaleY(1.2)", transformOrigin: "bottom" }}
              >
                WELCOME!
              </h1>
              <h2 className="text-[24px] font-light leading-none mt-3 tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#F8FAFC] to-[#94A3B8]" style={{ fontFamily: "sans-serif" }}>
                USER LOGIN
              </h2>
            </div>

            {resetError === "Password updated successfully! Please login." && (
              <p className="text-[#301A6A] font-medium text-[13px] mb-4">
                {resetError}
              </p>
            )}

            {/* Form */}
            {mode === "login" && (
              <form action={loginActionDispatch} className="flex flex-col gap-4">
                {/* Email / Username Input */}
                <div className="h-[46px] bg-white/50 backdrop-blur-md flex items-center px-4 rounded-[4px] border border-white/30 relative">
                  <User size={16} className="text-[#301A6A] shrink-0" />
                  <input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="user name" 
                    required 
                    className="bg-transparent border-none text-[#301A6A] text-[13px] font-medium outline-none w-full ml-3 placeholder:text-[#301A6A]/60"
                  />
                </div>

                {/* Password Input */}
                <div className="h-[46px] bg-white/50 backdrop-blur-md flex items-center px-4 rounded-[4px] border border-white/30 relative">
                  <Lock size={16} className="text-[#301A6A] shrink-0" />
                  <input 
                    id="password" 
                    name="password"
                    type="password"
                    placeholder="password" 
                    required 
                    className="bg-transparent border-none text-[#301A6A] text-[13px] font-medium outline-none w-full ml-3 placeholder:text-[#301A6A]/60"
                  />
                </div>

                <div className="flex flex-col gap-6 mt-2">
                  <div className="flex justify-end mt-2">
                    <button 
                      type="submit" 
                      disabled={isLoginPending}
                      className="h-[38px] px-8 bg-gradient-to-r from-[#8C92B5] to-[#3B2C79] text-white text-[13px] uppercase font-medium tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center shrink-0 w-full sm:w-auto"
                    >
                      {isLoginPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "LOG IN"}
                    </button>
                  </div>
                </div>

                {loginState?.error && (
                  <p className="text-[13px] font-semibold text-red-700 mt-2">{loginState.error}</p>
                )}
              </form>
            )}

            {mode === "forgot" && (
              <form action={handleForgotSubmit} className="flex flex-col gap-4">
                <div className="h-[46px] bg-white/50 backdrop-blur-md flex items-center px-4 rounded-[4px] border border-white/30 relative">
                  <User size={16} className="text-[#301A6A] shrink-0" />
                  <input 
                    id="forgot-email" 
                    name="email"
                    type="email" 
                    placeholder="email address" 
                    required 
                    disabled={isResetPending}
                    className="bg-transparent border-none text-[#301A6A] text-[13px] font-medium outline-none w-full ml-3 placeholder:text-[#301A6A]/60"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                    <button type="button" onClick={() => setMode("login")} className="text-[12px] text-[#554B86] hover:text-[#301A6A] font-medium transition-colors underline decoration-[#554B86]/40 underline-offset-4">
                      Back to login
                    </button>
                    
                    <button 
                      type="submit" 
                      disabled={isResetPending}
                      className="h-[38px] px-8 bg-gradient-to-r from-[#8C92B5] to-[#3B2C79] text-white text-[13px] lowercase font-medium tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center shrink-0 w-full sm:w-auto"
                    >
                      {isResetPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "send code"}
                    </button>
                </div>
                {resetError && <p className="text-[13px] font-semibold text-red-700 mt-2">{resetError}</p>}
              </form>
            )}

            {mode === "reset" && (
              <form action={handleResetSubmit} className="flex flex-col gap-4">
                <div className="h-[46px] bg-white/50 backdrop-blur-md flex items-center px-4 rounded-[4px] border border-white/30 relative">
                  <Lock size={16} className="text-[#301A6A] shrink-0" />
                  <input 
                    id="otp" 
                    name="otp"
                    type="text" 
                    placeholder="6-digit code" 
                    required 
                    maxLength={6}
                    disabled={isResetPending}
                    className="bg-transparent border-none text-[#301A6A] text-[13px] font-medium outline-none w-full ml-3 placeholder:text-[#301A6A]/60"
                  />
                </div>

                <div className="h-[46px] bg-white/50 backdrop-blur-md flex items-center px-4 rounded-[4px] border border-white/30 relative">
                  <Lock size={16} className="text-[#301A6A] shrink-0" />
                  <input 
                    id="newPassword" 
                    name="newPassword"
                    type="password"
                    placeholder="new password"
                    required 
                    minLength={8}
                    disabled={isResetPending}
                    className="bg-transparent border-none text-[#301A6A] text-[13px] font-medium outline-none w-full ml-3 placeholder:text-[#301A6A]/60"
                  />
                </div>

                <div className="h-[46px] bg-white/50 backdrop-blur-md flex items-center px-4 rounded-[4px] border border-white/30 relative">
                  <Lock size={16} className="text-[#301A6A] shrink-0" />
                  <input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password"
                    placeholder="confirm password"
                    required 
                    minLength={8}
                    disabled={isResetPending}
                    className="bg-transparent border-none text-[#301A6A] text-[13px] font-medium outline-none w-full ml-3 placeholder:text-[#301A6A]/60"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                  <button type="button" onClick={() => setMode("login")} className="text-[12px] text-[#554B86] hover:text-[#301A6A] font-medium transition-colors underline decoration-[#554B86]/40 underline-offset-4">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isResetPending}
                    className="h-[38px] px-8 bg-gradient-to-r from-[#8C92B5] to-[#3B2C79] text-white text-[13px] lowercase font-medium tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center shrink-0 w-full sm:w-auto"
                  >
                    {isResetPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "reset!"}
                  </button>
                </div>

                {resetError && <p className="text-[13px] font-semibold text-red-700 mt-2">{resetError}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
      

    </div>
  )
}
