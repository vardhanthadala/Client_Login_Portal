"use client"

import React from "react"
import Link from "next/link"
import { Bell, MessageSquare, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react"
import { useNotificationsStore } from "@/store/notificationsStore"

export default function AdminNotificationsTabClient() {
  const { notifications, markAsRead } = useNotificationsStore()

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white font-sans flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="flex items-center justify-center px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] dark:bg-[#10B981]/20 text-[13px] font-bold border border-[#10B981]/20">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] mt-2 font-medium">
            Actionable alerts and updates across all your clients.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-[#161616] rounded-[24px] border border-[#E2E8F0] dark:border-[#222] shadow-sm flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 bg-[#F8FAFC] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6 border border-[#E2E8F0] dark:border-[#333] shadow-inner">
              <Bell className="w-10 h-10 text-[#94A3B8] dark:text-[#666]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">All caught up!</h3>
            <p className="text-[#64748B] dark:text-[#888] font-medium">You have no new notifications right now.</p>
          </div>
        ) : (
          notifications.map((item) => {
            const icon = item.type === "MESSAGE" ? <MessageSquare className="w-4 h-4" /> : item.type === "APPROVAL" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />
            const colorClass = item.type === "MESSAGE" ? "text-blue-600 dark:text-blue-400" : item.type === "APPROVAL" ? (item.title.includes("approved") ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400") : "text-red-600 dark:text-red-400"
            const bgClass = item.type === "MESSAGE" ? "bg-blue-50 dark:bg-blue-500/10" : item.type === "APPROVAL" ? (item.title.includes("approved") ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10") : "bg-red-50 dark:bg-red-500/10"

            return (
              <Link
                key={item.id}
                href={item.link || "#"}
                onClick={() => markAsRead(item.id)}
                className={`group flex flex-col sm:flex-row sm:items-center gap-5 p-5 border rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 transform hover:-translate-y-0.5 relative ${item.isRead ? 'bg-transparent border-[#E2E8F0] dark:border-[#2A2E35]' : 'bg-white dark:bg-[#161616] border-[#10B981]/30 dark:border-[#10B981]/30'}`}
              >
                {!item.isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-[#10B981] rounded-r-full" />
                )}
                
                <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0 ${bgClass} ${colorClass} shadow-sm border border-current/10 ml-2`}>
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className={`font-bold text-[16px] truncate ${item.isRead ? 'text-[#64748B] dark:text-[#94A3B8]' : 'text-[#0F172A] dark:text-white'}`}>{item.clientName}</span>
                    <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#444] shrink-0" />
                    <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] truncate uppercase tracking-wider">{item.title}</span>
                  </div>
                  <p className={`text-[15px] truncate font-medium ${item.isRead ? 'text-[#94A3B8] dark:text-[#666]' : 'text-[#334155] dark:text-[#CBD5E1]'}`}>{item.message}</p>
                </div>

                <div className="flex items-center justify-end sm:flex-col sm:items-end gap-3 shrink-0 mt-3 sm:mt-0">
                  <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-[13px] font-bold text-[#10B981] -translate-x-2 group-hover:translate-x-0 duration-300">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
