"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, LogOut, X, Heart } from "lucide-react"
import Image from "next/image"
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
        <AlertDialogContent style={{ maxWidth: 650, width: '100%' }} className="p-0 rounded-[24px] overflow-hidden border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white dark:bg-[#111111] grid grid-cols-2 gap-0">
          
          <AlertDialogCancel className="absolute right-4 top-4 z-10 border-0 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full w-auto h-auto mt-0 shadow-none">
            <X className="w-5 h-5 text-gray-500" />
          </AlertDialogCancel>

          {/* Left Column */}
          <div className="flex flex-col p-10 justify-center h-full">
            <div className="text-[11px] font-bold text-[#8B5CF6] tracking-wider uppercase mb-5">
              LOG OUT
            </div>
            <AlertDialogTitle className="text-[26px] font-bold text-[#0F172A] dark:text-white tracking-tight mb-3 font-sans">
              Log out of Dexze?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] font-medium text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-8">
              You'll be logged out and need to sign in again to continue.
            </AlertDialogDescription>

            <div className="flex items-center gap-3 w-full mb-10">
              <AlertDialogCancel 
                disabled={isLoading}
                className="flex-1 rounded-[12px] h-11 text-[14px] font-semibold border-[#E2E8F0] dark:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] mt-0 text-[#0F172A] dark:text-white"
              >
                Cancel
              </AlertDialogCancel>
              <Button 
                onClick={handleSignOut} 
                disabled={isLoading}
                className="flex-1 rounded-[12px] h-11 text-[14px] font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-colors border-0"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Log out
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <Heart className="w-[14px] h-[14px] text-[#8B5CF6]" />
              <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">We'll see you soon!</span>
            </div>
          </div>

          {/* Right Column / Image */}
          <div className="bg-[#F8FAFC] dark:bg-[#1A1A1A] h-full w-full relative min-h-[350px]">
            <Image 
              src="/logout-illustration.png" 
              alt="Log out illustration" 
              fill 
              className="object-cover object-center scale-105" 
            />
          </div>

        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
