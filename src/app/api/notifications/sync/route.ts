import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// POST /api/notifications/sync — Generate notifications from data events
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, data, adminUserId } = await req.json()
    const userId = session.user.id
    const notifications: {
      userId: string
      type: string
      title: string
      message: string
      link?: string
      sourceId: string
      clientName?: string
      clientId?: string
    }[] = []

    if (role === "ADMIN") {
      const clients = data || []
      for (const client of clients) {
        const profile = client.clientProfile
        if (!profile) continue
        const clientName = profile.companyName || profile.clientName || "Unknown Client"

        // Unread messages from clients (not sent by admin)
        for (const msg of (profile.messages || [])) {
          if (msg.senderId !== adminUserId && !msg.isRead) {
            notifications.push({
              userId,
              type: "MESSAGE",
              title: "New Message",
              message: msg.content
                ? (msg.content.length > 60 ? msg.content.substring(0, 60) + "..." : msg.content)
                : "New message received",
              sourceId: `msg-${msg.id}`,
              clientName,
              clientId: client.id,
              link: `/admin/client/${client.id}?tab=messages`,
            })
          }
        }

        // Approval items that were approved or had changes requested by client
        for (const approval of (profile.approvals || [])) {
          for (const item of (approval.items || [])) {
            if (item.status === "APPROVED" || item.status === "CHANGES_REQUESTED") {
              const actionStr = item.status === "APPROVED" ? "approved" : "requested changes on"
              notifications.push({
                userId,
                type: "APPROVAL",
                title: `File ${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)}`,
                message: `Client ${actionStr} "${item.fileName}"`,
                sourceId: `app-${item.id}-${item.status}`,
                clientName,
                clientId: client.id,
                link: `/admin/client/${client.id}?tab=approvals`,
              })
            }
          }
        }

        // Overdue invoices
        for (const invoice of (profile.invoices || [])) {
          if (invoice.status === "OVERDUE") {
            notifications.push({
              userId,
              type: "INVOICE",
              title: "Overdue Invoice",
              message: `Invoice "${invoice.title}" is overdue for payment.`,
              sourceId: `inv-${invoice.id}-overdue`,
              clientName,
              clientId: client.id,
              link: `/admin/client/${client.id}?tab=billing`,
            })
          }
        }
      }
    } else if (role === "CLIENT") {
      const profile = data
      if (profile) {
        // Messages from admin (not sent by client)
        for (const msg of (profile.messages || [])) {
          if (msg.senderId !== profile.userId && !msg.isRead) {
            notifications.push({
              userId,
              type: "MESSAGE",
              title: "New Message",
              message: "Agency sent you a message",
              sourceId: `msg-${msg.id}`,
              link: "?tab=messages",
            })
          }
        }

        // Pending approvals
        for (const approval of (profile.approvals || [])) {
          const hasPending = approval.items?.some((item: any) => item.status === "PENDING");
          if (hasPending) {
            notifications.push({
              userId,
              type: "APPROVAL",
              title: "Approval Required",
              message: "Agency has requested approval on new files.",
              sourceId: `app-${approval.id}`,
              link: "?tab=approvals",
            })
          }
        }

        // Unpaid invoices
        for (const invoice of (profile.invoices || [])) {
          if (invoice.status === "SENT" || invoice.status === "OVERDUE") {
            notifications.push({
              userId,
              type: "INVOICE",
              title: invoice.status === "OVERDUE" ? "Overdue Invoice" : "New Invoice",
              message: `Invoice "${invoice.title}" is awaiting payment.`,
              sourceId: `inv-${invoice.id}-${invoice.status}`,
              link: "?tab=billing",
            })
          }
        }
      }
    }

    // Upsert notifications — create only if sourceId doesn't exist yet for this user
    let created = 0
    for (const notif of notifications) {
      try {
        await prisma.notification.upsert({
          where: {
            userId_sourceId: {
              userId: notif.userId,
              sourceId: notif.sourceId,
            },
          },
          create: notif,
          update: {
            // Don't overwrite isRead if notification already exists
            title: notif.title,
            message: notif.message,
          },
        })
        created++
      } catch (e) {
        // Skip duplicates silently
      }
    }

    return NextResponse.json({ success: true, synced: created })
  } catch (error) {
    console.error("Failed to sync notifications:", error)
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 })
  }
}
