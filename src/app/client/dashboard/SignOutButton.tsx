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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { signOut } from "next-auth/react"

export default function SignOutButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    toast.success("Signing out...", { duration: 2000 })
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <>
      {variant === "sidebar" ? (
        <button 
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left"
        >
          <div className="w-4 flex justify-center">
            <LogOut className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
          </div>
          <span className="text-[#0F172A] dark:text-white text-[14px]">Logout</span>
        </button>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[12px] h-11 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[14px] font-normal tracking-wide">
            Sign Out
          </span>
        </button>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent style={{ maxWidth: 650, width: '100%' }} className="p-0 rounded-[24px] overflow-hidden border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white dark:bg-[#111111] grid grid-cols-2 gap-0">
          
          <AlertDialogCancel className="absolute right-4 top-4 z-10 border-0 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full w-auto h-auto mt-0 shadow-none">
            <X className="w-5 h-5 text-gray-500" />
          </AlertDialogCancel>

          {/* Left Column */}
          <div className="flex flex-col p-10 justify-center h-full">
            <div className="text-[11px] font-normal text-[#8B5CF6] tracking-wider uppercase mb-5">
              LOG OUT
            </div>
            <AlertDialogTitle className="text-[26px] font-normal text-[#0F172A] dark:text-white tracking-tight mb-3 font-sans">
              Log out of Dexze?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] font-normal text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-8">
              You'll be logged out and need to sign in again to continue.
            </AlertDialogDescription>

            <div className="flex items-center gap-3 w-full mb-10">
              <AlertDialogCancel 
                disabled={isLoading}
                className="flex-1 rounded-[12px] h-11 text-[14px] font-normal border-[#E2E8F0] dark:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] mt-0 text-[#0F172A] dark:text-white"
              >
                Cancel
              </AlertDialogCancel>
              <Button 
                onClick={handleSignOut} 
                disabled={isLoading}
                className="flex-1 rounded-[12px] h-11 text-[14px] font-normal bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-colors border-0"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Log out
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <Heart className="w-[14px] h-[14px] text-[#8B5CF6]" />
              <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">We'll see you soon!</span>
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
