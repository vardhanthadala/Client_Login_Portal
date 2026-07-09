"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cancelSubscriptionAction } from "@/app/actions/superadmin"

export default function CancelSubscriptionButton({ tenantId, onClose }: { tenantId: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("Too Expensive")

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await cancelSubscriptionAction(tenantId, reason)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Subscription has been set to cancel at the end of the billing cycle.")
        onClose()
      }
    } catch (error) {
      toast.error("Failed to cancel subscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-4 border-t border-[#E9EDF4] dark:border-[#2A2E35] mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="mb-4">
        <h4 className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-white font-sans">Cancel Subscription?</h4>
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed mt-1">
          Are you sure you want to cancel this company's subscription? 
          This will instruct Razorpay to cancel it at the <strong className="text-[#0F172A] dark:text-white">end of their current billing cycle</strong>.
        </p>
      </div>
      
      <div className="py-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] ml-1 mb-2">Reason for Cancellation</label>
        <select 
          value={reason} 
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-10 rounded-[12px] border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1E24] px-4 py-2 text-[14px] text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all duration-200 shadow-inner appearance-none cursor-pointer"
        >
          <option value="Too Expensive">Too Expensive</option>
          <option value="Missing Features">Missing Features</option>
          <option value="Out of Business">Out of Business</option>
          <option value="Switched to Competitor">Switched to Competitor</option>
          <option value="Poor Support">Poor Support</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto h-11 rounded-[12px] px-6 text-[14px] font-bold border-[#E2E8F0] dark:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1E24] text-[#64748B] dark:text-[#94A3B8]">
          Keep Active
        </Button>
        <Button 
          onClick={handleCancel}
          disabled={loading}
          className="w-full sm:w-auto h-11 rounded-[12px] px-6 text-[14px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_14px_rgba(225,29,72,0.3)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.4)] transition-all duration-300"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Yes, Cancel at cycle end
        </Button>
      </div>
    </div>
  )
}
