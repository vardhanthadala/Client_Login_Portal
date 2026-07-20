"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { overrideSubscriptionAction } from "@/app/actions/superadmin"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    <div className="pt-5 border-t border-gray-100 dark:border-[#222] mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="mb-5">
        <h4 className="text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white">Override Subscription</h4>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-1">
          Manually change this company's plan tier or expiration date. This overrides Razorpay's billing sync.
        </p>
      </div>
      
      <div className="grid gap-5 py-2">
        <div className="grid gap-2">
          <label className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Subscription Plan</label>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger className="w-full h-10 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] px-3 py-2 text-[14px] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A1E24]">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg shadow-md animate-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
              <SelectItem value="FREE" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">FREE</SelectItem>
              <SelectItem value="MONTHLY" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">MONTHLY</SelectItem>
              <SelectItem value="VIP" className="text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#1A1E24] focus:bg-gray-100 dark:focus:bg-[#1A1E24] cursor-pointer rounded-md my-0.5 text-gray-700 dark:text-gray-300">VIP (Custom)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <label className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Expiration Date <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span></label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] px-3 py-2 text-[14px] text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors shadow-sm"
          />
          <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500 mt-1">Leave blank for no expiration date.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto h-10 rounded-lg px-5 text-[13px] font-medium border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#1A1E24] text-gray-700 dark:text-[#94A3B8]">
          Back
        </Button>
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto h-10 rounded-lg px-5 text-[13px] font-semibold bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black shadow-sm transition-colors">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Override
        </Button>
      </div>
    </div>
  )
}
