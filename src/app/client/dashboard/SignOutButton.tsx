"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"
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

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    toast.success("Signing out...", { duration: 2000 })
    await signOut({ redirect: false })
    window.location.replace("/client-login")
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-start bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[14px] p-1 h-12 transition-all shadow-sm relative group"
      >
        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-black/10">
          <span className="text-[#EF4444] font-bold text-sm tracking-tight">N</span>
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 text-[14px] font-semibold text-white tracking-wide">
          Sign Out
        </span>
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to log back in to access your client portal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleSignOut} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Out
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
