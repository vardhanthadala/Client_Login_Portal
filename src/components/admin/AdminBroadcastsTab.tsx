"use client"

import { useNotificationsStore } from "@/store/notificationsStore"
import { format } from "date-fns"
import { Megaphone, Calendar, Clock, BellRing, Sparkles } from "lucide-react"

export default function AdminBroadcastsTab() {
  const notifications = useNotificationsStore(state => state.notifications)
  const broadcasts = notifications.filter(n => n.type === "SYSTEM")

  // Array of beautiful gradient colors for distinct broadcast icons
  const gradients = [
    "from-blue-400 to-cyan-300",
    "from-purple-400 to-indigo-400",
    "from-emerald-300 to-teal-400",
    "from-orange-300 to-rose-300",
    "from-pink-400 to-rose-400"
  ]

  if (broadcasts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#111318] rounded-[24px] border border-slate-100 dark:border-slate-800/50 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 flex items-center justify-center mb-6 ring-4 ring-white dark:ring-[#111318] shadow-sm">
          <BellRing className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-[22px] font-normal text-slate-800 dark:text-slate-100 mb-2 tracking-wide">You're all caught up!</h3>
        <p className="text-[15px] font-light text-slate-500 dark:text-slate-400 max-w-sm">
          There are no system broadcasts right now. Important announcements will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Simple, clean page header without a card background */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-[28px] font-medium text-slate-900 dark:text-white tracking-tight mb-2">
          System Broadcasts
        </h2>
        <p className="text-[15px] font-light text-slate-500 dark:text-slate-400">
          Important announcements, maintenance schedules, and critical platform updates.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {broadcasts.map((broadcast, index) => {
          const gradient = gradients[index % gradients.length]
          
          return (
            <div 
              key={broadcast.id}
              className="group flex flex-col bg-white dark:bg-[#111318] rounded-[20px] border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden"
            >
              {/* Colorful Top Accent Bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
              
              <div className="p-6 sm:p-8 flex gap-5 sm:gap-6">
                {/* Left Icon Area */}
                <div className="hidden sm:flex shrink-0">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm ring-4 ring-white dark:ring-[#111318] group-hover:scale-105 transition-transform duration-300`}>
                    <Megaphone className="w-5 h-5 text-white drop-shadow-sm" />
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-[18px] sm:text-[20px] font-medium text-slate-800 dark:text-slate-200 leading-snug mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {broadcast.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 rounded-full text-[13px] font-normal border border-slate-100 dark:border-slate-700/50">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {format(new Date(broadcast.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 rounded-full text-[13px] font-normal border border-slate-100 dark:border-slate-700/50">
                          <Clock className="w-3.5 h-3.5 text-rose-400" />
                          {format(new Date(broadcast.createdAt), "h:mm a")}
                        </div>
                      </div>
                    </div>
                    {/* Mobile Icon */}
                    <div className="sm:hidden shrink-0">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                        <Megaphone className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-[12px] p-5 sm:p-6 border border-slate-100/80 dark:border-slate-800/30">
                    <div className="text-[15px] sm:text-[16px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-[1.8] font-light">
                      {broadcast.message}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
