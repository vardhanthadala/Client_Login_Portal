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
import { signOut } from "next-auth/react"

export default function SignOutButton({ isMini = false, variant = "button" }: { isMini?: boolean, variant?: "button" | "dropdown" }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    toast.success("Signing out...", { duration: 2000 })
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <>
      {variant === "dropdown" ? (
        <button 
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-normal text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 text-left transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      ) : (
        <Button 
          variant="ghost"
          onClick={() => setOpen(true)}
          className={isMini 
            ? "w-[42px] h-[42px] p-0 flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors border-0 shadow-none"
            : "w-full flex items-center justify-start gap-3 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 rounded-md text-[14px] font-medium transition-colors border-0 shadow-none h-auto"
          }
        >
          <LogOut className={isMini ? "w-5 h-5" : "w-[18px] h-[18px] shrink-0"} />
          {!isMini && <span>Sign Out</span>}
        </Button>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-[400px] p-0 rounded-[28px] overflow-hidden border border-white/20 dark:border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-2xl">
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              {/* Premium Icon Container */}
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center relative shadow-inner border border-black/5 dark:border-white/5">
                <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-xl animate-pulse"></div>
                <LogOut className="w-7 h-7 text-red-500 relative z-10 ml-1" strokeWidth={2} />
              </div>

              {/* Typography */}
              <AlertDialogTitle className="text-[22px] font-normal text-[#0F172A] dark:text-white tracking-tight mb-2">
                Ready to leave?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[14px] font-normal text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-8">
                You will be securely signed out of your session. You can sign back in anytime.
              </AlertDialogDescription>

              {/* Buttons */}
              <div className="flex items-center gap-3 w-full">
                <AlertDialogCancel 
                  disabled={isLoading}
                  className="flex-1 rounded-xl h-11 text-[14px] font-normal border-0 bg-gray-100/80 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-[#0F172A] dark:text-white transition-colors m-0"
                >
                  Stay
                </AlertDialogCancel>
                <Button 
                  onClick={handleSignOut} 
                  disabled={isLoading}
                  className="flex-1 rounded-xl h-11 text-[14px] font-normal bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] transition-all border-0 m-0"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
