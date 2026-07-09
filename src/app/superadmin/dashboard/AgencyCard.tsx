"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Mail, Calendar, Users, Hash, Settings2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ManageSubscriptionDialog from "./ManageSubscriptionDialog"
import CancelSubscriptionButton from "./CancelSubscriptionButton"

export default function AgencyCard({ tenant, isExpired }: { tenant: any, isExpired: boolean }) {
  const [open, setOpen] = useState(false)
  const [activeView, setActiveView] = useState<'details' | 'manage' | 'cancel'>('details')

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) setTimeout(() => setActiveView('details'), 300)
    }}>
      <DialogTrigger
        render={
          <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 min-w-0 flex flex-col overflow-hidden group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 p-6 sm:p-8 gap-3 relative transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
              <div className="min-w-0 flex-1 relative z-10 flex items-center gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#0F172A] dark:text-white truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tenant.name}
                  </h3>
                  <div className="mt-2 flex items-center">
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-mono bg-[#F8FAFC] dark:bg-[#1A1E24] border border-[#E2E8F0] dark:border-[#333] px-2 py-0.5 rounded-md">
                      ID: {tenant.id.slice(0, 8)}...{tenant.id.slice(-6)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center shrink-0 w-full sm:w-auto justify-start sm:justify-end gap-2 mt-2 sm:mt-0 relative z-10">
                <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${isExpired ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'}`}>
                  {isExpired ? "Expired" : "Active"}
                </span>
                <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                  {tenant.subscriptionPlan.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        }
      />

      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] bg-white dark:bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-6 sm:p-8 border-b border-[#F1F5F9] dark:border-[#222] bg-slate-50/50 dark:bg-[#161B22]/50 relative overflow-hidden rounded-t-[24px]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full -mr-10 -mt-10"></div>
          <DialogHeader className="relative z-10 text-left">
            <DialogTitle className="text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white font-sans pr-6">{tenant.name}</DialogTitle>
            <DialogDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
              Complete company details and subscription management.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-xl mt-0.5">
                <Hash className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1.5">Company ID</p>
                <p className="text-[13px] text-[#0F172A] dark:text-white font-mono font-medium bg-[#F8FAFC] dark:bg-[#1A1E24] border border-[#E2E8F0] dark:border-[#333] px-3 py-2 rounded-[12px] break-all shadow-inner">
                  {tenant.id}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-xl mt-0.5">
                <Mail className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1.5">Admin Email</p>
                <p className="text-[15px] text-[#0F172A] dark:text-white font-bold break-all">
                  {tenant.users[0]?.email || "No admin email"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-xl mt-0.5">
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1.5">Total Clients</p>
                <p className="text-[18px] text-[#0F172A] dark:text-white font-bold tabular-nums">
                  {tenant._count.clientProfiles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#333] rounded-2xl p-5 shadow-inner">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold tracking-[0.1em] text-[#64748B] dark:text-[#888] uppercase mb-1.5">Started</p>
                  <p className="text-[14px] font-bold text-[#0F172A] dark:text-white">{tenant.subscriptionStart ? format(new Date(tenant.subscriptionStart), "MMM d, yyyy") : "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold tracking-[0.1em] text-[#64748B] dark:text-[#888] uppercase mb-1.5">Ends</p>
                  <p className="text-[14px] font-bold text-[#0F172A] dark:text-white">{tenant.subscriptionEnd ? format(new Date(tenant.subscriptionEnd), "MMM d, yyyy") : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2 flex flex-col items-stretch justify-end gap-3 border-t border-[#F1F5F9] dark:border-[#222]">
            {tenant.cancelAtPeriodEnd ? (
              <span className="px-4 py-2.5 rounded-xl text-[13px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 w-full text-center shadow-sm">
                Cancels Soon
              </span>
            ) : (
              !isExpired && tenant.subscriptionStatus !== "CANCELLED" && (
                <>
                  {activeView === 'details' && (
                    <div className="flex w-full sm:w-auto gap-3 items-center sm:justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveView('manage')}
                        className="h-9 px-4 text-[12px] font-bold text-[#0F172A] dark:text-white bg-white dark:bg-[#222] border border-[#E2E8F0] dark:border-[#333] shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 rounded-xl"
                      >
                        <Settings2 className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                        Manage Sub
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveView('cancel')}
                        className="h-9 px-4 text-[12px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 shadow-sm hover:shadow-md hover:border-rose-500/40 transition-all duration-300 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {activeView === 'manage' && (
                    <ManageSubscriptionDialog 
                      tenantId={tenant.id} 
                      currentPlan={tenant.subscriptionPlan} 
                      currentEnd={tenant.subscriptionEnd} 
                      onClose={() => setActiveView('details')}
                    />
                  )}
                  {activeView === 'cancel' && (
                    <CancelSubscriptionButton 
                      tenantId={tenant.id} 
                      onClose={() => setActiveView('details')}
                    />
                  )}
                </>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
