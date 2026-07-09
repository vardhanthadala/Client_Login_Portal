"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { overrideSubscriptionAction } from "@/app/actions/superadmin"

export default function ManageSubscriptionDialog({ 
  tenantId, 
  currentPlan, 
  currentEnd,
  onClose
}: { 
  tenantId: string, 
  currentPlan: string, 
  currentEnd: Date | null,
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(currentPlan)
  const [endDate, setEndDate] = useState<string>(currentEnd ? new Date(currentEnd).toISOString().split('T')[0] : "")

  const handleSave = async () => {
    setLoading(true)
    try {
      const newEnd = endDate ? new Date(endDate) : null
      const res = await overrideSubscriptionAction(tenantId, plan, newEnd)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Subscription successfully overridden!")
        onClose()
      }
    } catch (error) {
      toast.error("Failed to override subscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-4 border-t border-[#E9EDF4] dark:border-[#2A2E35] mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="mb-4">
        <h4 className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-white font-sans">Override Subscription</h4>
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed mt-1">
          Manually change this company's plan tier or expiration date. This overrides Razorpay's billing sync.
        </p>
      </div>
      
      <div className="grid gap-5 py-2">
        <div className="grid gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] ml-1">Subscription Plan</label>
          <select 
            value={plan} 
            onChange={(e) => setPlan(e.target.value)}
            className="w-full h-10 rounded-[12px] border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1E24] px-4 py-2 text-[14px] text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 shadow-inner appearance-none cursor-pointer"
          >
            <option value="FREE">FREE</option>
            <option value="MONTHLY">MONTHLY</option>
            <option value="YEARLY">YEARLY</option>
            <option value="VIP">VIP (Custom)</option>
            <option value="LIFETIME">LIFETIME (Custom)</option>
          </select>
        </div>
        
        <div className="grid gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] ml-1">Expiration Date <span className="opacity-60">(Optional)</span></label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-10 rounded-[12px] border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1E24] px-4 py-2 text-[14px] text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 shadow-inner"
          />
          <p className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] ml-1 mt-1">Leave blank for no expiration date.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto h-11 rounded-[12px] px-6 text-[14px] font-bold border-[#E2E8F0] dark:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1E24] text-[#64748B] dark:text-[#94A3B8]">
          Back
        </Button>
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto h-11 rounded-[12px] px-6 text-[14px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] transition-all duration-300">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Override
        </Button>
      </div>
    </div>
  )
}
