"use client"

import { useActionState, useState } from "react"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff } from "lucide-react"


export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)

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
          <CardHeader className="space-y-1 pt-12 pb-8">
            <CardTitle className="text-3xl font-medium text-center text-gray-900">Welcome back</CardTitle>
          </CardHeader>
          <form action={action}>
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
              </div>
              {state?.error && (
                <p className="text-[14px] font-medium text-red-500 text-center pt-2">{state.error}</p>
              )}
              
              <div className="pt-4 pb-2">
                <Button 
                  type="submit" 
                  className="w-full bg-[#2ea3f2] hover:bg-[#258bce] text-white h-12 rounded-lg text-[15px] font-medium transition-colors" 
                  disabled={isPending}
                >
                  {isPending ? (
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
        </Card>
      </div>
    </div>
  )
}
