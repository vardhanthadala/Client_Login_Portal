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
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-[#E2E8F0]/60 dark:border-[#222] rounded-[24px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl [&>button]:hidden">
        <div className="p-8 pb-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-500/20 dark:border-indigo-500/10">
            <KeyRound className="w-8 h-8 text-indigo-500 dark:text-indigo-400 drop-shadow-sm" strokeWidth={1.25} />
          </div>
          
          <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white font-sans tracking-tight mb-2">
            Reset Client Password
          </h2>
          
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] mb-6 font-normal leading-relaxed">
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
                className="pr-10 h-12 rounded-xl border-[#E2E8F0] dark:border-[#333] bg-white dark:bg-[#111] text-[15px] focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 shadow-sm transition-all font-medium"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button 
                type="button" 
                onClick={() => setOpen(false)} 
                disabled={loading}
                className="flex-1 h-12 rounded-xl border border-[#E2E8F0] dark:border-[#333] bg-white dark:bg-[#111] text-[14px] font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-white transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-100 dark:to-white text-white dark:text-slate-900 text-[14px] font-medium hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-slate-900/10"
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
