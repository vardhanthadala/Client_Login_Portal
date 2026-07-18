"use client"

import { useEffect, useState } from "react"
import { getSuperAdminLogs } from "@/app/actions/superadmin"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Activity, Zap, Sparkles, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
      <Card className="flex justify-center items-center h-[400px] w-full bg-white dark:bg-[#171A21] border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A52FF]" />
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#171A21] border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-white/5 flex items-center justify-center mb-4">
          <Activity className="w-5 h-5 text-[#94A3B8] dark:text-[#64748B]" />
        </div>
        <CardTitle className="text-lg font-sans font-medium text-[#0F172A] dark:text-white tracking-tight mb-1">Activity Feed</CardTitle>
        <CardDescription className="text-sm text-[#64748B] dark:text-[#94A3B8] font-normal">No recent activity detected on the platform.</CardDescription>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-auto flex flex-col min-w-0">
      <CardHeader className="pb-4 px-6 pt-6 sm:px-8 sm:pt-8 border-b border-[#F1F5F9] dark:border-white/5 shrink-0">
        <CardTitle className="text-lg font-sans font-medium text-[#0F172A] dark:text-white tracking-tight">Platform Activity</CardTitle>
        <CardDescription className="text-sm text-[#64748B] dark:text-[#94A3B8] font-normal mt-1">Live feed of important platform events.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto hidden-scrollbar p-0">
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          {logs.map((log) => {
            let Icon = Zap
            let iconWrapperStyle = "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_4px_15px_rgba(168,85,247,0.3)] dark:shadow-[0_4px_20px_rgba(168,85,247,0.4)] border border-white/30 dark:border-white/10"
            let iconColor = "text-white"

            if (log.action === "AGENCY_CREATED") {
              Icon = Sparkles
              iconWrapperStyle = "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_4px_15px_rgba(20,184,166,0.3)] dark:shadow-[0_4px_20px_rgba(20,184,166,0.4)] border border-white/30 dark:border-white/10"
              iconColor = "text-white"
            } else if (log.action === "SUBSCRIPTION_CANCELLED") {
              Icon = ShieldAlert
              iconWrapperStyle = "bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 shadow-[0_4px_15px_rgba(239,68,68,0.3)] dark:shadow-[0_4px_20px_rgba(239,68,68,0.4)] border border-white/30 dark:border-white/10"
              iconColor = "text-white"
            }

            return (
              <div key={log.id} className="flex gap-4 sm:gap-5 items-start sm:items-center relative group p-4 sm:px-6 sm:py-5 bg-white dark:bg-[#1C1F26] border border-[#E2E8F0] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${iconWrapperStyle} relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.08] group-hover:rotate-3`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 dark:via-white/10 dark:to-white/20 rounded-[14px]"></div>
                  <Icon className={`w-5 h-5 ${iconColor} relative z-10 drop-shadow-md`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <p className="text-[14px] font-normal text-[#0F172A] dark:text-[#E2E8F0] leading-relaxed truncate">
                    {log.message}
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    {log.tenant && (
                      <div className="flex items-center gap-2 font-normal text-[#334155] dark:text-[#E2E8F0] bg-[#F8FAFC]/80 dark:bg-black/20 backdrop-blur-md border border-[#E2E8F0] dark:border-white/10 pl-1 pr-3 py-1 rounded-full shadow-sm transition-all duration-300 group-hover:bg-white dark:group-hover:bg-black/40 group-hover:border-[#CBD5E1] dark:group-hover:border-white/20">
                        {(() => {
                          const adminWithImage = log.tenant.users?.find((u: any) => u.image);
                          const imageUrl = adminWithImage?.image;

                          if (imageUrl) {
                            // If it's a raw S3 url, route it through the file proxy
                            const imgSrc = imageUrl.startsWith("http") ? `/api/file?url=${encodeURIComponent(imageUrl)}` : imageUrl;

                            return (
                              <img
                                src={imgSrc}
                                alt={log.tenant.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0 border border-white dark:border-[#333] shadow-sm transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${log.tenant.id}`;
                                }}
                              />
                            )
                          }

                          return (
                            <img
                              src={`https://i.pravatar.cc/150?u=${log.tenant.id}`}
                              alt={log.tenant.name}
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-white dark:border-[#333] shadow-sm transition-transform duration-300 group-hover:scale-110"
                            />
                          )
                        })()}
                        <span className="text-[12px] truncate max-w-[130px]">{log.tenant.name}</span>
                      </div>
                    )}
                    <span className="text-[13px] font-normal text-[#94A3B8] dark:text-[#64748B]">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
