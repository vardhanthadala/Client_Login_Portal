"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelSubscriptionAction } from "@/app/actions/superadmin"

export default function CancelSubscriptionButton({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("Too Expensive")

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await cancelSubscriptionAction(tenantId, reason)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Subscription has been set to cancel at the end of the billing cycle.")
        setOpen(false)
      }
    } catch (error) {
      toast.error("Failed to cancel subscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm" className="text-xs font-semibold h-7" disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : "Cancel"}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this agency's subscription? 
            This will instruct Razorpay to cancel it at the <strong>end of their current billing cycle</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation</label>
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Too Expensive">Too Expensive</option>
            <option value="Missing Features">Missing Features</option>
            <option value="Out of Business">Out of Business</option>
            <option value="Switched to Competitor">Switched to Competitor</option>
            <option value="Poor Support">Poor Support</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Keep Active</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleCancel()
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Yes, Cancel at cycle end
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
