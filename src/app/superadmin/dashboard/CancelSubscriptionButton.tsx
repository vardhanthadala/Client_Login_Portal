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

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await cancelSubscriptionAction(tenantId)
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
            This will instruct Razorpay to cancel it at the <strong>end of their current billing cycle</strong>, 
            meaning they will retain access until their current period expires, but they will not be charged again.
          </AlertDialogDescription>
        </AlertDialogHeader>
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
