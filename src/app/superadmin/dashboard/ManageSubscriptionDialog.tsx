"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Settings2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { overrideSubscriptionAction } from "@/app/actions/superadmin"

export default function ManageSubscriptionDialog({ 
  tenantId, 
  currentPlan, 
  currentEnd 
}: { 
  tenantId: string, 
  currentPlan: string, 
  currentEnd: Date | null 
}) {
  const [open, setOpen] = useState(false)
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
        setOpen(false)
      }
    } catch (error) {
      toast.error("Failed to override subscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-7 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:bg-gray-50">
            <Settings2 className="w-3 h-3 mr-1" />
            Manage Sub
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Override Subscription</DialogTitle>
          <DialogDescription>
            Manually change this agency's plan tier or expiration date. This will override Razorpay's billing sync until the new expiration date.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Subscription Plan</label>
            <select 
              value={plan} 
              onChange={(e) => setPlan(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="FREE">FREE</option>
              <option value="MONTHLY">MONTHLY</option>
              <option value="YEARLY">YEARLY</option>
              <option value="VIP">VIP (Custom)</option>
              <option value="LIFETIME">LIFETIME (Custom)</option>
            </select>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Expiration Date (Optional)</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500">Leave blank for no expiration date.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
