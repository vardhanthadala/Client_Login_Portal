"use client"

import { useState } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ManageSubscriptionDialog from "../../ManageSubscriptionDialog"
import CancelSubscriptionButton from "../../CancelSubscriptionButton"

interface CompanyActionsProps {
  tenantId: string
  currentPlan: string
  currentEnd: Date | null
  cancelAtPeriodEnd: boolean
  isExpired: boolean
  subscriptionStatus: string
}

export default function CompanyActions({
  tenantId,
  currentPlan,
  currentEnd,
  cancelAtPeriodEnd,
  isExpired,
  subscriptionStatus
}: CompanyActionsProps) {
  const [activeView, setActiveView] = useState<'details' | 'manage' | 'cancel'>('details')

  if (cancelAtPeriodEnd) {
    return (
      <span className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-medium tracking-tight bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
        Cancels Soon
      </span>
    )
  }

  if (isExpired || subscriptionStatus === "CANCELLED") {
    return null;
  }

  return (
    <>
      {activeView === 'details' && (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveView('manage')}
            className="h-10 px-5 text-[13px] font-semibold text-white dark:text-black bg-gray-900 dark:bg-white border border-transparent hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors rounded-lg shadow-sm"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveView('cancel')}
            className="h-10 px-5 text-[13px] font-semibold text-rose-600 dark:text-rose-400 bg-transparent border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors rounded-lg shadow-sm"
          >
            Cancel Subscription
          </Button>
        </div>
      )}
      
      {activeView === 'manage' && (
        <div className="max-w-xl">
          <ManageSubscriptionDialog
            tenantId={tenantId}
            currentPlan={currentPlan}
            currentEnd={currentEnd}
            onClose={() => setActiveView('details')}
          />
        </div>
      )}
      
      {activeView === 'cancel' && (
        <div className="max-w-xl">
          <CancelSubscriptionButton
            tenantId={tenantId}
            onClose={() => setActiveView('details')}
          />
        </div>
      )}
    </>
  )
}
