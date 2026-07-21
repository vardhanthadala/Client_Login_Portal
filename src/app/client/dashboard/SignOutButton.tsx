"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, LogOut, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { signOut } from "next-auth/react"

export default function SignOutButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    toast.success("Logging out...", { duration: 2000 })
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
            Logout
          </span>
        </button>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-[400px] w-full p-6 rounded-[24px] border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white dark:bg-[#111111]">
          
          <AlertDialogCancel className="absolute right-4 top-4 z-10 border-0 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full w-auto h-auto mt-0 shadow-none">
            <X className="w-5 h-5 text-gray-500" />
          </AlertDialogCancel>

          <div className="flex flex-col items-center justify-center text-center mt-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6 text-gray-600 dark:text-gray-400 ml-1" />
            </div>
            <AlertDialogTitle className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Are you sure you want to log out? You will need to log back in to access your account.
            </AlertDialogDescription>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <AlertDialogCancel 
                disabled={isLoading}
                className="flex-1 w-full rounded-lg h-11 text-[14px] font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 mt-0 text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
              >
                Cancel
              </AlertDialogCancel>
              <Button 
                onClick={handleSignOut} 
                disabled={isLoading}
                className="flex-1 w-full rounded-lg h-11 text-[14px] font-medium bg-[#111827] hover:bg-[#1f2937] text-white transition-colors border-0"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Logout
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
