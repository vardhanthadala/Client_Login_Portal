"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cancelSubscriptionAction } from "@/app/actions/superadmin"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    <div className="pt-5 border-t border-gray-100 dark:border-[#222] mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="mb-5">
        <h4 className="text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white">Cancel Subscription?</h4>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-1">
          Are you sure you want to cancel this company's subscription? 
          This will instruct Razorpay to cancel it at the <strong className="font-semibold text-gray-900 dark:text-white">end of their current billing cycle</strong>.
        </p>
      </div>
      
      <div className="py-2">
        <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Cancellation</label>
        <Select value={reason} onValueChange={(val) => setReason(val || "")}>
          <SelectTrigger className="w-full h-10 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] px-3 py-2 text-[14px] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-500/40 transition-colors shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A1E24]">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg shadow-md animate-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
            <SelectItem value="Too Expensive" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">Too Expensive</SelectItem>
            <SelectItem value="Missing Features" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">Missing Features</SelectItem>
            <SelectItem value="Out of Business" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">Out of Business</SelectItem>
            <SelectItem value="Switched to Competitor" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">Switched to Competitor</SelectItem>
            <SelectItem value="Poor Support" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">Poor Support</SelectItem>
            <SelectItem value="Other" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto h-10 rounded-lg px-5 text-[13px] font-medium border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#1A1E24] text-gray-700 dark:text-[#94A3B8]">
          Keep Active
        </Button>
        <Button 
          onClick={handleCancel}
          disabled={loading}
          className="w-full sm:w-auto h-10 rounded-lg px-5 text-[13px] font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Yes, Cancel at cycle end
        </Button>
      </div>
    </div>
  )
}
