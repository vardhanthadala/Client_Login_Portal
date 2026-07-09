"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, X } from "lucide-react"
import { createAgencyAction } from "@/app/actions/superadmin"

export default function AddAgencyDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <DialogTrigger className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 inline-flex items-center justify-center rounded-[14px] text-[13px] font-bold transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 tracking-wide">
        Add Company
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] bg-white dark:bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-6 sm:p-8">

        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white font-sans">Add New Company</DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
            Create a new tenant workspace and admin account.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-5 py-2">
          <div>
            <label htmlFor="agencyName" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] ml-1 mb-2">Company Name</label>
            <input id="agencyName" name="agencyName" required placeholder="Acme Corp" className="w-full h-10 rounded-[12px] border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1E24] px-4 py-2 text-[14px] text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 shadow-inner placeholder:text-[#94A3B8] placeholder:font-medium" />
          </div>
          <div>
            <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] ml-1 mb-2">Admin Email</label>
            <input id="email" name="email" type="email" required placeholder="admin@acme.com" className="w-full h-10 rounded-[12px] border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1E24] px-4 py-2 text-[14px] text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 shadow-inner placeholder:text-[#94A3B8] placeholder:font-medium" />
          </div>
          <div>
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] ml-1 mb-2">Admin Password</label>
            <input id="password" name="password" type="password" required className="w-full h-10 rounded-[12px] border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1E24] px-4 py-2 text-[14px] text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 shadow-inner" />
          </div>
          <div>
            <label htmlFor="trialDays" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] ml-1 mb-2">Trial Duration (Days)</label>
            <input id="trialDays" name="trialDays" type="number" min="1" defaultValue="15" required className="w-full h-10 rounded-[12px] border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1E24] px-4 py-2 text-[14px] text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 shadow-inner" />
          </div>

          {error && <p className="text-[13px] text-rose-500 font-bold ml-1 bg-rose-50 p-2 rounded-md">{error}</p>}

          <Button type="submit" className="w-full h-12 rounded-[14px] px-6 text-[14px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] transition-all duration-300 mt-2" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Company"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
