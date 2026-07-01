"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { setupAdminAction } from "@/app/actions/setup"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function SetupForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const res = await setupAdminAction(formData)
    
    if (res?.error) {
      toast.error(res.error)
    } else if (res?.success) {
      toast.success(res.message)
      router.push("/login")
    }
    
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md bg-white border-none shadow-sm rounded-2xl">
      <CardHeader className="space-y-1 pt-12 pb-8">
        <CardTitle className="text-3xl font-medium text-center text-gray-900">Setup Admin</CardTitle>
      </CardHeader>
      <form onSubmit={handleSetup}>
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
                placeholder="••••••••"
                required
                minLength={8}
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
          <div className="pt-4 pb-2">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#2ea3f2] hover:bg-[#258bce] text-white h-12 rounded-lg text-[15px] font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
