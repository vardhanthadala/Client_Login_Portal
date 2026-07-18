"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminResetClientPassword } from "@/app/actions/client"
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ResetPasswordButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    const res = await adminResetClientPassword(clientId, newPassword)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Password reset successfully. An email has been sent to the client.")
      setOpen(false)
      setNewPassword("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-white dark:bg-[#111] h-9 px-4 py-2 border-[#E5E7EB] dark:border-[#333] text-[#475569] dark:text-[#94A3B8] hover:text-[#22C55E] dark:hover:text-[#22C55E] hover:border-[#22C55E]/30 hover:bg-[#F8FAFC] dark:hover:bg-[#161616] shadow-sm">
        <KeyRound className="w-4 h-4" />
        Reset Password
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none rounded-[24px] shadow-2xl bg-white dark:bg-[#111] [&>button]:hidden">
        <div className="p-8 pb-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-[#22C55E]/10 dark:bg-[#22C55E]/20 rounded-full flex items-center justify-center mb-6">
            <KeyRound className="w-12 h-12 text-[#22C55E]" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white font-sans tracking-tight mb-2">
            Reset Client Password
          </h2>
          
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] mb-6">
            Set a new secure password. We'll automatically notify the client with their updated login credentials.
          </p>

          <form onSubmit={handleReset} className="w-full space-y-6">
            <div className="relative text-left">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter new password"
                className="pr-10 h-12 rounded-xl border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[15px] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E]"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button 
                type="button" 
                onClick={() => setOpen(false)} 
                disabled={loading}
                className="flex-1 h-12 rounded-xl border border-[#E2E8F0] dark:border-[#333] bg-white dark:bg-[#111] text-[14px] font-bold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-[1.5] h-12 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-[14px] font-bold hover:bg-[#1E293B] dark:hover:bg-[#E2E8F0] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save & Send Email
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
