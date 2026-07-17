"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SignOutButton({ isMini = false }: { isMini?: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    toast.success("Signing out...", { duration: 2000 })
    try {
      // Get CSRF token first
      const csrfRes = await fetch("/api/auth/csrf")
      const { csrfToken } = await csrfRes.json()
      // Post to signout endpoint
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `csrfToken=${encodeURIComponent(csrfToken)}`,
      })
    } catch (e) {
      // Ignore errors - redirect regardless
    }
    window.location.href = "/login"
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className={isMini 
          ? "w-10 h-10 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-all border-0 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]"
          : "w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 h-11 text-[15px] font-medium transition-all border-0 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] hover:-translate-y-0.5"
        }
      >
        {isMini ? <LogOut className="w-4 h-4" /> : "Sign Out"}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-[400px] p-8 rounded-[32px] gap-0 border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:bg-[#111111]">
          
          <div className="flex flex-col items-center text-center">
            {/* Illustrative Icon */}
            <div className="w-24 h-24 mb-6 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-red-400/20 blur-md animate-pulse"></div>
              <LogOut className="w-10 h-10 text-red-500 relative z-10 -ml-1" strokeWidth={2.5} />
            </div>

            {/* Typography */}
            <AlertDialogTitle className="text-2xl font-bold font-sans text-[#0F172A] dark:text-white tracking-tight mb-3">
              Leaving so soon?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] font-medium text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-8 px-2">
              You're about to sign out. You will need to log back in to access the company dashboard.
            </AlertDialogDescription>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full">
              <AlertDialogCancel 
                disabled={isLoading}
                className="flex-1 rounded-[16px] h-12 text-[15px] font-semibold border-[#E2E8F0] dark:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] mt-0"
              >
                Cancel
              </AlertDialogCancel>
              <Button 
                onClick={handleSignOut} 
                disabled={isLoading}
                className="flex-1 rounded-[16px] h-12 text-[15px] font-semibold bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-[#E2E8F0] dark:text-black text-white transition-colors"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign out
              </Button>
            </div>
          </div>
          
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
