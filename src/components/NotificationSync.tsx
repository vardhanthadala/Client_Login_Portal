"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useNotificationsStore, RealTimeNotification, NotificationType } from "@/store/notificationsStore"

interface NotificationSyncProps {
  role: "ADMIN" | "CLIENT"
  data: any // `clients` for ADMIN, `clientProfile` for CLIENT
  adminUserId?: string // used to filter out admin's own messages
}

export default function NotificationSync({ role, data, adminUserId }: NotificationSyncProps) {
  const router = useRouter()
  const setNotifications = useNotificationsStore(state => state.setNotifications)
  const prevDataStr = useRef<string>("")

  useEffect(() => {
    // Setup client-side polling using Next.js soft refresh
    const interval = setInterval(() => {
      router.refresh()
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    // Aggregate notifications safely without triggering infinite loops
    const currentDataStr = JSON.stringify(data)
    if (prevDataStr.current === currentDataStr) return // No changes
    prevDataStr.current = currentDataStr

    const notifications: RealTimeNotification[] = []

    if (role === "ADMIN") {
      const clients = data || []
      clients.forEach((client: any) => {
        const profile = client.clientProfile
        if (!profile) return
        const clientName = profile.companyName || profile.clientName || "Unknown Client"

        // Admin Messages
        ;(profile.messages || []).forEach((msg: any) => {
          if (msg.senderId !== adminUserId) {
            notifications.push({
              id: `msg-${msg.id}`,
              type: "MESSAGE",
              title: "New Message",
              message: msg.content ? (msg.content.length > 60 ? msg.content.substring(0, 60) + "..." : msg.content) : "New message received",
              createdAt: msg.createdAt,
              isRead: false,
              clientName,
              clientId: client.id,
              link: `/admin/client/${client.id}?tab=messages`
            })
          }
        })

        // Admin Approvals
        ;(profile.approvals || []).forEach((approval: any) => {
          ;(approval.items || []).forEach((item: any) => {
            const actionStr = item.status === "APPROVED" ? "approved" : "requested changes on"
            notifications.push({
              id: `app-${item.id}`,
              type: "APPROVAL",
              title: `File ${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)}`,
              message: `Client ${actionStr} "${item.fileName}"`,
              createdAt: item.updatedAt || item.createdAt,
              isRead: false,
              clientName,
              clientId: client.id,
              link: `/admin/client/${client.id}?tab=approvals`
            })
          })
        })

        // Admin Invoices
        ;(profile.invoices || []).forEach((invoice: any) => {
          if (invoice.status === "OVERDUE") {
            notifications.push({
              id: `inv-${invoice.id}`,
              type: "INVOICE",
              title: "Overdue Invoice",
              message: `Invoice "${invoice.title}" is overdue for payment.`,
              createdAt: invoice.dueDate || invoice.createdAt,
              isRead: false,
              clientName,
              clientId: client.id,
              link: `/admin/client/${client.id}?tab=billing`
            })
          }
        })
      })
    } else if (role === "CLIENT") {
      const profile = data
      if (profile) {
        // Client Messages
        ;(profile.messages || []).forEach((msg: any) => {
          if (msg.senderId !== profile.userId) { // assuming profile.userId is the client
            notifications.push({
              id: `msg-${msg.id}`,
              type: "MESSAGE",
              title: "New Message",
              message: "Agency sent you a message",
              createdAt: msg.createdAt,
              isRead: false,
              link: "?tab=messages"
            })
          }
        })

        // Client Approvals
        ;(profile.approvals || []).forEach((approval: any) => {
          if (approval.status === "PENDING") {
            notifications.push({
              id: `app-${approval.id}`,
              type: "APPROVAL",
              title: "Approval Required",
              message: `Agency has requested approval on new files.`,
              createdAt: approval.createdAt,
              isRead: false,
              link: "?tab=approvals"
            })
          }
        })

        // Client Invoices
        ;(profile.invoices || []).forEach((invoice: any) => {
          if (invoice.status === "SENT" || invoice.status === "OVERDUE") {
            notifications.push({
              id: `inv-${invoice.id}`,
              type: "INVOICE",
              title: invoice.status === "OVERDUE" ? "Overdue Invoice" : "New Invoice",
              message: `Invoice "${invoice.title}" is awaiting payment.`,
              createdAt: invoice.createdAt,
              isRead: false,
              link: "?tab=billing"
            })
          }
        })
        
        // Client Projects
        ;(profile.projects || []).forEach((project: any) => {
          notifications.push({
            id: `proj-${project.id}`,
            type: "PROJECT",
            title: "Project Active",
            message: `Project "${project.name}" is currently active.`,
            createdAt: project.createdAt,
            isRead: false,
            link: "?tab=projects"
          })
        })
      }
    }

    // Sort newest first
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    setNotifications(notifications)
  }, [data, role, adminUserId, setNotifications])

  return null // Render nothing, it's just a sync layer
}
