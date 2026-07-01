"use client"

import { useActionState, useState } from "react"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-xl rounded-2xl">
        <CardHeader className="space-y-2 pt-8 pb-4">
          <CardTitle className="text-3xl font-bold tracking-[-0.02em] text-center text-foreground">Dexze Portal</CardTitle>
          <CardDescription className="text-muted-foreground text-center text-base">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="client@company.com" 
                required 
                className="bg-muted/50 border-border placeholder:text-muted-foreground focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="bg-muted/50 border-border focus-visible:ring-primary h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {state?.error && (
              <p className="text-sm font-medium text-destructive text-center">{state.error}</p>
            )}
          </CardContent>
          <CardFooter className="px-8 pb-8 pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
