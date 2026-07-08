import React from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Bell, MessageSquare, CheckCircle, AlertTriangle, Clock, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function NotificationsTab() {
  const session = await auth()
  const tenantId = session?.user?.tenantId
  const adminUserId = session?.user?.id

  // Fetch clients to aggregate notifications
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      tenantId: tenantId
    },
    include: {
      clientProfile: {
        include: {
          messages: {
            where: { isRead: false },
            orderBy: { createdAt: 'desc' }
          },
          approvals: {
            include: {
              items: {
                where: {
                  status: { in: ["APPROVED", "CHANGES_REQUESTED"] }
                }
              }
            }
          },
          invoices: {
            where: {
              status: "OVERDUE"
            }
          }
        }
      }
    },
  })

  type NotificationItem = {
    id: string;
    type: "MESSAGE" | "APPROVAL" | "INVOICE";
    title: string;
    description: string;
    date: Date;
    clientName: string;
    clientId: string;
    link: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
  }

  const notifications: NotificationItem[] = []

  clients.forEach(client => {
    const profile = client.clientProfile
    if (!profile) return

    const clientName = profile.companyName || profile.clientName || "Unknown Client"

    // Messages
    profile.messages.forEach(msg => {
      // Don't notify for admin's own messages if they somehow got marked unread
      if (msg.senderId !== adminUserId) {
        notifications.push({
          id: `msg-${msg.id}`,
          type: "MESSAGE",
          title: "New Message",
          description: msg.content.length > 60 ? msg.content.substring(0, 60) + "..." : msg.content,
          date: msg.createdAt,
          clientName,
          clientId: client.id,
          link: `/admin/client/${client.id}?tab=messages`,
          icon: <MessageSquare className="w-4 h-4" />,
          colorClass: "text-blue-600 dark:text-blue-400",
          bgClass: "bg-blue-50 dark:bg-blue-500/10"
        })
      }
    })

    // Approvals
    profile.approvals.forEach(approval => {
      approval.items.forEach(item => {
        const actionStr = item.status === "APPROVED" ? "approved" : "requested changes on"
        notifications.push({
          id: `app-${item.id}`,
          type: "APPROVAL",
          title: `File ${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)}`,
          description: `Client ${actionStr} "${item.fileName}"`,
          date: item.updatedAt,
          clientName,
          clientId: client.id,
          link: `/admin/client/${client.id}?tab=approvals`,
          icon: <CheckCircle className="w-4 h-4" />,
          colorClass: item.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
          bgClass: item.status === "APPROVED" ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10"
        })
      })
    })

    // Invoices
    profile.invoices.forEach(invoice => {
      notifications.push({
        id: `inv-${invoice.id}`,
        type: "INVOICE",
        title: "Overdue Invoice",
        description: `Invoice "${invoice.title}" is overdue for payment.`,
        date: invoice.dueDate || invoice.updatedAt,
        clientName,
        clientId: client.id,
        link: `/admin/client/${client.id}?tab=billing`,
        icon: <AlertTriangle className="w-4 h-4" />,
        colorClass: "text-red-600 dark:text-red-400",
        bgClass: "bg-red-50 dark:bg-red-500/10"
      })
    })
  })

  // Sort chronologically (newest first)
  notifications.sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white font-sans flex items-center gap-3">
            Notifications
            {notifications.length > 0 && (
              <span className="flex items-center justify-center px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] dark:bg-[#10B981]/20 text-[13px] font-bold border border-[#10B981]/20">
                {notifications.length} New
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
          notifications.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group flex flex-col sm:flex-row sm:items-center gap-5 p-5 bg-white dark:bg-[#161616] border border-[#E2E8F0] dark:border-[#2A2E35] rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#10B981]/40 dark:hover:border-[#10B981]/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0 ${item.bgClass} ${item.colorClass} shadow-sm border border-current/10`}>
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-bold text-[16px] text-[#0F172A] dark:text-white truncate">{item.clientName}</span>
                  <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#444] shrink-0" />
                  <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] truncate uppercase tracking-wider">{item.title}</span>
                </div>
                <p className="text-[15px] text-[#334155] dark:text-[#CBD5E1] truncate font-medium">{item.description}</p>
              </div>

              <div className="flex items-center justify-end sm:flex-col sm:items-end gap-3 shrink-0 mt-3 sm:mt-0">
                <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-[13px] font-bold text-[#10B981] -translate-x-2 group-hover:translate-x-0 duration-300">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
