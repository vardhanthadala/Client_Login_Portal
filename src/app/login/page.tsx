"use client"

import { useActionState, useState } from "react"
import { loginAction, requestPasswordReset, verifyOtpAndResetPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

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

    // append email manually
    formData.append("email", resetEmail)
    const res = await verifyOtpAndResetPassword(formData)
    
    setIsResetPending(false)
    if (res.error) {
      setResetError(res.error)
    } else {
      // Success - back to login
      setMode("login")
      setResetError("Password updated successfully! Please login.")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-bg.png"
          alt="Abstract Background"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Dexze Portal</h2>
          <p className="text-lg text-zinc-300 max-w-md">
            Manage your clients, track progress, and securely share deliverables all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-none shadow-sm rounded-2xl">
          {mode === "login" && (
            <>
              <CardHeader className="space-y-1 pt-12 pb-8">
                <CardTitle className="text-3xl font-medium text-center text-gray-900">Welcome back</CardTitle>
                {resetError === "Password updated successfully! Please login." && (
                  <CardDescription className="text-green-600 font-medium text-center pt-2">
                    {resetError}
                  </CardDescription>
                )}
              </CardHeader>
              <form action={loginActionDispatch}>
                <CardContent className="space-y-5 px-10">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[14px] font-medium text-gray-700">E-mail</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      className="bg-gray-50/50 border-gray-200 text-[15px] focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 h-12 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[14px] font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password"
                        type={showPassword ? "text" : "password"} 
                        required 
                        className="bg-gray-50/50 border-gray-200 text-[15px] focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 h-12 pr-12 transition-colors"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-[15px] w-[15px]" />
                        ) : (
                          <Eye className="h-[15px] w-[15px]" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button 
                        type="button" 
                        onClick={() => { setMode("forgot"); setResetError(null); }}
                        className="text-sm font-medium text-sky-600 hover:text-sky-500 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  {loginState?.error && (
                    <p className="text-[14px] font-medium text-red-500 text-center pt-2">{loginState.error}</p>
                  )}
                  
                  <div className="pt-4 pb-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#2ea3f2] hover:bg-[#258bce] text-white h-12 rounded-lg text-[15px] font-medium transition-colors" 
                      disabled={isLoginPending}
                    >
                      {isLoginPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </>
          )}

          {mode === "forgot" && (
            <>
              <CardHeader className="space-y-2 pt-8 pb-6 px-10">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-fit mb-2 text-gray-500 hover:text-gray-700 p-0 hover:bg-transparent"
                  onClick={() => { setMode("login"); setResetError(null); }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Button>
                <CardTitle className="text-3xl font-medium text-gray-900">Forgot Password</CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  Enter your email address and we'll send you a 6-digit code to reset your password.
                </CardDescription>
              </CardHeader>
              <form action={handleForgotSubmit}>
                <CardContent className="space-y-5 px-10 pb-8">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-[14px] font-medium text-gray-700">E-mail</Label>
                    <Input 
                      id="forgot-email" 
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      disabled={isResetPending}
                      className="bg-gray-50/50 border-gray-200 text-[15px] focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 h-12 transition-colors"
                    />
                  </div>
                  
                  {resetError && (
                    <p className="text-[14px] font-medium text-red-500 text-center pt-2">{resetError}</p>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#2ea3f2] hover:bg-[#258bce] text-white h-12 rounded-lg text-[15px] font-medium transition-colors" 
                      disabled={isResetPending}
                    >
                      {isResetPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Send Code"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </>
          )}

          {mode === "reset" && (
            <>
              <CardHeader className="space-y-2 pt-8 pb-6 px-10">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-fit mb-2 text-gray-500 hover:text-gray-700 p-0 hover:bg-transparent"
                  onClick={() => { setMode("login"); setResetError(null); }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Button>
                <CardTitle className="text-3xl font-medium text-gray-900">Reset Password</CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  Check your email for the 6-digit code and enter your new password.
                </CardDescription>
              </CardHeader>
              <form action={handleResetSubmit}>
                <CardContent className="space-y-5 px-10 pb-8">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-[14px] font-medium text-gray-700">6-Digit Code</Label>
                    <Input 
                      id="otp" 
                      name="otp"
                      type="text" 
                      placeholder="123456" 
                      required 
                      maxLength={6}
                      disabled={isResetPending}
                      className="bg-gray-50/50 border-gray-200 text-[15px] focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 h-12 transition-colors tracking-widest font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[14px] font-medium text-gray-700">New Password</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword" 
                        name="newPassword"
                        type={showPassword ? "text" : "password"} 
                        required 
                        minLength={8}
                        disabled={isResetPending}
                        className="bg-gray-50/50 border-gray-200 text-[15px] focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 h-12 pr-12 transition-colors"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isResetPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-[15px] w-[15px]" />
                        ) : (
                          <Eye className="h-[15px] w-[15px]" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[14px] font-medium text-gray-700">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"} 
                      required 
                      minLength={8}
                      disabled={isResetPending}
                      className="bg-gray-50/50 border-gray-200 text-[15px] focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 h-12 transition-colors"
                    />
                  </div>
                  
                  {resetError && (
                    <p className="text-[14px] font-medium text-red-500 text-center pt-2">{resetError}</p>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#2ea3f2] hover:bg-[#258bce] text-white h-12 rounded-lg text-[15px] font-medium transition-colors" 
                      disabled={isResetPending}
                    >
                      {isResetPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </>
          )}

        </Card>
      </div>
    </div>
  )
}
