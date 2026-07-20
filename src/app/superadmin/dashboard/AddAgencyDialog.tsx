"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, X, Eye, EyeOff } from "lucide-react"
import { createAgencyAction } from "@/app/actions/superadmin"

export default function AddAgencyDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createAgencyAction(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white h-10 px-5 inline-flex items-center justify-center rounded-[14px] text-[13px] font-bold transition-all shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.5)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 tracking-wide">
        Add Company
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] bg-white dark:bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-6 sm:p-8">

        <DialogHeader className="mb-4">
          <DialogTitle className="text-[22px] tracking-tight text-[#0F172A] dark:text-white font-sans">Add New Company</DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed mt-1.5">
            Create a new tenant workspace and admin account.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="agencyName" className="block text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] ml-1">Company Name</label>
            <input id="agencyName" name="agencyName" required placeholder="e.g., Acme Corp" className="w-full h-11 rounded-xl border border-[#E2E8F0] dark:border-white/5 bg-white dark:bg-[#1C2029] px-4 text-[14px] text-[#0F172A] dark:text-white font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm placeholder:text-[#94A3B8] placeholder:font-normal hover:border-[#CBD5E1] dark:hover:border-white/10" />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] ml-1">Admin Email</label>
            <input id="email" name="email" type="email" required placeholder="admin@acme.com" className="w-full h-11 rounded-xl border border-[#E2E8F0] dark:border-white/5 bg-white dark:bg-[#1C2029] px-4 text-[14px] text-[#0F172A] dark:text-white font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm placeholder:text-[#94A3B8] placeholder:font-normal hover:border-[#CBD5E1] dark:hover:border-white/10" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] ml-1">Admin Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" className="w-full h-11 rounded-xl border border-[#E2E8F0] dark:border-white/5 bg-white dark:bg-[#1C2029] pl-4 pr-11 text-[14px] text-[#0F172A] dark:text-white font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm placeholder:text-[#94A3B8] placeholder:font-normal hover:border-[#CBD5E1] dark:hover:border-white/10" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="trialDays" className="block text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] ml-1">Trial Duration (Days)</label>
            <input id="trialDays" name="trialDays" type="number" min="1" defaultValue="15" className="w-full h-11 rounded-xl border border-[#E2E8F0] dark:border-white/5 bg-white dark:bg-[#1C2029] px-4 text-[14px] text-[#0F172A] dark:text-white font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm hover:border-[#CBD5E1] dark:hover:border-white/10" />
          </div>

          {error && <p className="text-[13px] text-rose-500 font-medium ml-1 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-100 dark:border-rose-500/20">{error}</p>}

          <div className="pt-2">
            <Button type="submit" className="w-full h-12 rounded-xl text-[14px] font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-[0_8px_20px_rgba(168,85,247,0.25)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.4)] transition-all duration-300" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
