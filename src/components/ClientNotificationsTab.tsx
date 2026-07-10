"use client"

import { useNotificationsStore } from "@/store/notificationsStore"
import { motion, AnimatePresence } from "framer-motion"
import { Check, CheckCircle2, MessageSquare, CheckSquare, FolderKanban, Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ClientNotificationsTab() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationsStore()

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getIcon = (type: string, isRead: boolean) => {
    const className = `w-5 h-5 ${isRead ? 'text-[#94A3B8]' : 'text-white'}`
    switch (type) {
      case 'MESSAGE': return <MessageSquare className={className} />
      case 'APPROVAL': return <CheckSquare className={className} />
      case 'PROJECT': return <FolderKanban className={className} />
      default: return <Bell className={className} />
    }
  }

  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-[#F1F5F9] dark:bg-[#222]'
    switch (type) {
      case 'MESSAGE': return 'bg-[#3B82F6]'
      case 'APPROVAL': return 'bg-[#F59E0B]'
      case 'PROJECT': return 'bg-[#10B981]'
      default: return 'bg-[#8B5CF6]'
    }
  }

  const timeAgo = (dateStr: string) => {
    const ms = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(ms / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444] text-white text-[12px] font-bold shadow-sm">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] mt-1 text-sm font-medium">
            Stay updated on your projects and approvals
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline"
            onClick={markAllAsRead}
            className="rounded-xl border-[#E2E8F0] dark:border-[#333] hover:bg-[#FAFAFA] dark:hover:bg-[#1A1A1A] font-semibold text-[13px] text-[#0F172A] dark:text-white"
          >
            <CheckCheck className="w-4 h-4 mr-2 text-[#10B981]" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#222] rounded-[24px] shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] dark:bg-[#1A1A1A] flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-2">You're all caught up!</h3>
            <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] max-w-[250px]">
              We'll notify you here when there's an update on your projects.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#E2E8F0] dark:divide-[#222]">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`transition-colors relative block group ${notif.isRead ? 'bg-transparent' : 'bg-[#FAFAFA] dark:bg-[#161616]'}`}
                >
                  <Link 
                    href={notif.link || "#"} 
                    onClick={() => markAsRead(notif.id)}
                    className="p-6 flex gap-4 w-full h-full items-start"
                  >
                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]" />
                    )}
                    
                    <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center shadow-sm ${getBgColor(notif.type, notif.isRead)}`}>
                      {getIcon(notif.type, notif.isRead)}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-[15px] truncate pr-4 ${notif.isRead ? 'font-semibold text-[#0F172A] dark:text-white/80' : 'font-bold text-[#0F172A] dark:text-white'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[12px] font-medium text-[#94A3B8] shrink-0">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className={`text-[14px] leading-relaxed pr-8 ${notif.isRead ? 'text-[#64748B] dark:text-[#888]' : 'text-[#475569] dark:text-[#E2E8F0]'}`}>
                        {notif.message}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <div className="shrink-0 flex items-center justify-center pl-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-[#222] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#333] text-[#94A3B8] hover:text-[#10B981] transition-all shadow-sm group-hover:scale-100"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
