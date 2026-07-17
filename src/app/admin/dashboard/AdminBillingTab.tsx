"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { CreditCard, ShieldCheck, AlertTriangle, Calendar, Award, RefreshCw, Ban } from "lucide-react"
import { toast } from "sonner"
import { cancelAdminSubscriptionAction } from "@/app/actions/admin"

interface AdminBillingTabProps {
  tenant: {
    subscriptionPlan: string
    subscriptionStatus: string
    subscriptionStart: string | Date | null
    subscriptionEnd: string | Date | null
    cancelAtPeriodEnd: boolean
  } | null
}

export default function AdminBillingTab({ tenant }: AdminBillingTabProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelState, setCancelState] = useState(tenant?.cancelAtPeriodEnd || false)

  const executeCancel = async () => {
    try {
      setIsCancelling(true)
      const res = await cancelAdminSubscriptionAction()
      if (res?.error) {
        toast.error(res.error, {
          style: { fontWeight: 'normal' }
        })
      } else {
        toast.success("Subscription set to cancel at the end of the billing cycle.", {
          style: { fontWeight: 'normal' }
        })
        setCancelState(true)
      }
    } catch (e) {
      toast.error("Failed to cancel subscription", {
        style: { fontWeight: 'normal' }
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCancel = () => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-[#171A21] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-sans w-[350px]">
        <span className="text-[13px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.
        </span>
        <div className="flex justify-end gap-2 text-[12px]">
          <button 
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1.5 border border-slate-200 dark:border-white/5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-normal transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t)
              await executeCancel()
            }}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-normal transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Title */}
      <div className="bg-white dark:bg-[#171A21] p-6 rounded-[24px] border border-[#E5E7EB] dark:border-white/5 shadow-sm">
        <h2 className="text-2xl font-normal text-[#0F172A] dark:text-white tracking-tight mb-1">Billing & Subscriptions</h2>
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-normal">Manage your platform subscription plan, renewal details, and billing settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Plan details */}
        <div className="lg:col-span-2 bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[24px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-5">
            <div>
              <h3 className="text-lg font-normal text-[#0F172A] dark:text-white tracking-tight">Active Plan Details</h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">Summary of your active agency subscription.</p>
            </div>
            <span className={`text-xs font-normal px-3 py-1 rounded-full ${tenant?.subscriptionStatus === "ACTIVE" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-amber-500/10 text-amber-500"}`}>
              {tenant?.subscriptionStatus || "ACTIVE"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-[#3454d1] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal uppercase tracking-wider block">Current Plan</span>
                <span className="text-[15px] font-normal text-slate-800 dark:text-white block mt-0.5 capitalize">{tenant?.subscriptionPlan || "FREE"} Plan</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#3454d1] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal uppercase tracking-wider block">Billing Period</span>
                <span className="text-[15px] font-normal text-slate-800 dark:text-white block mt-0.5">
                  {tenant?.subscriptionStart ? format(new Date(tenant.subscriptionStart), 'MMM dd, yyyy') : "N/A"}
                  {" - "}
                  {tenant?.subscriptionEnd ? format(new Date(tenant.subscriptionEnd), 'MMM dd, yyyy') : "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#3454d1] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal uppercase tracking-wider block">Auto-Renew Status</span>
                <span className="text-[15px] font-normal text-slate-800 dark:text-white block mt-0.5">
                  {cancelState ? "Cancels at end of cycle" : "Renews automatically"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#3454d1] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal uppercase tracking-wider block">Access Permissions</span>
                <span className="text-[15px] font-normal text-slate-800 dark:text-white block mt-0.5">All modules unlocked</span>
              </div>
            </div>
          </div>

          {/* Cancellation section */}
          {tenant && tenant.subscriptionPlan !== "FREE" && (
            <div className="border-t border-slate-100 dark:border-white/5 pt-5 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="max-w-md">
                <h4 className="text-[13px] font-normal text-slate-800 dark:text-white">Cancel Platform Subscription</h4>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">By cancelling, your agency dashboard remains fully active until the end of your billing cycle on {tenant?.subscriptionEnd ? format(new Date(tenant.subscriptionEnd), 'MMM dd, yyyy') : "N/A"}.</p>
              </div>
              {cancelState ? (
                <div className="bg-amber-500/10 text-amber-500 text-xs font-normal px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Scheduled for Cancellation
                </div>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[13px] font-normal transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Ban className="w-4 h-4" />
                  {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Payment & Invoices Info */}
        <div className="bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-normal text-[#0F172A] dark:text-white tracking-tight">Payment Details</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">Current payment methods.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
            <CreditCard className="w-8 h-8 text-[#3454d1] shrink-0" />
            <div>
              <span className="text-[13px] font-normal text-slate-800 dark:text-white block">Razorpay Subscription</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Charged automatically every period.</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-normal text-slate-400 dark:text-slate-500 uppercase tracking-wider">Billing History</h4>
            <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">No previous invoices found.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
