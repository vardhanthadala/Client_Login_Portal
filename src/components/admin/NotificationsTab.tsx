import React from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Bell, MessageSquare, CheckCircle, AlertTriangle, Clock, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import AdminNotificationsTabClient from "./AdminNotificationsTabClient"
import NotificationSync from "../NotificationSync"

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

  return (
    <>
      <NotificationSync role="ADMIN" data={clients} adminUserId={adminUserId} />
      <AdminNotificationsTabClient />
    </>
  )
}
