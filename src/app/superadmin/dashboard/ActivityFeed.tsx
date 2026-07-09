"use client"

import { useEffect, useState } from "react"
import { getSuperAdminLogs } from "@/app/actions/superadmin"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Plus, XCircle, Info, Activity } from "lucide-react"

export default function ActivityFeed() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const res = await getSuperAdminLogs()
      if (res?.success) {
        setLogs(res.data)
      }
      setLoading(false)
    }
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] w-full bg-white dark:bg-[#111111] rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A52FF]" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111111] rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#1C2029] flex items-center justify-center mb-4">
          <Activity className="w-6 h-6 text-[#94A3B8] dark:text-[#64748B]" />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2 font-sans tracking-tight">Activity Feed</h3>
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] text-center font-medium">No recent activity detected on the platform.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 h-full min-h-[400px] flex flex-col min-w-0 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
      <div className="pb-2 px-6 pt-6 sm:px-8 sm:pt-8 border-b border-[#F1F5F9] dark:border-[#222] shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/20 dark:to-blue-500/5 flex items-center justify-center shadow-inner border border-blue-100 dark:border-blue-500/20 relative">
            <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 rounded-[14px]"></div>
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 relative z-10" />
          </div>
          <h3 className="text-2xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Platform Activity</h3>
        </div>
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 mb-4 ml-1">Live feed of important platform events.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto hidden-scrollbar p-4 sm:p-6 space-y-2 relative z-10">
        {logs.map((log) => {
          let Icon = Info
          let iconColor = "text-blue-600 dark:text-blue-400"
          let bgColor = "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/20 dark:to-blue-500/5"
          let borderColor = "border-blue-100 dark:border-blue-500/20"

          if (log.action === "AGENCY_CREATED") {
            Icon = Plus
            iconColor = "text-emerald-600 dark:text-emerald-400"
            bgColor = "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/5"
            borderColor = "border-emerald-100 dark:border-emerald-500/20"
          } else if (log.action === "SUBSCRIPTION_CANCELLED") {
            Icon = XCircle
            iconColor = "text-rose-600 dark:text-rose-400"
            bgColor = "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/20 dark:to-rose-500/5"
            borderColor = "border-rose-100 dark:border-rose-500/20"
          }

          return (
            <div key={log.id} className="flex items-center gap-4 relative z-10 group p-3 sm:p-4 rounded-[16px] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#333] hover:bg-[#F8FAFC]/50 dark:hover:bg-[#1A1E24]/50 transition-all duration-300">
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border ${bgColor} ${borderColor} shadow-inner relative group-hover:scale-105 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${iconColor} relative z-10`} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <p className="text-[14px] font-bold text-[#0F172A] dark:text-white truncate">
                  {log.message}
                </p>
                <div className="flex items-center text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] gap-2 shrink-0">
                  {log.tenant && (
                    <>
                      <span className="font-bold text-[#475569] dark:text-[#cbd5e1] bg-white dark:bg-[#222] border border-[#E2E8F0] dark:border-[#333] px-2.5 py-1 rounded-md truncate max-w-[120px] sm:max-w-[200px] shadow-sm">{log.tenant.name}</span>
                      <span className="text-[#E2E8F0] dark:text-[#333] hidden sm:inline">•</span>
                    </>
                  )}
                  <span className="bg-[#F1F5F9] dark:bg-[#1C2029] px-2.5 py-1 rounded-md">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
