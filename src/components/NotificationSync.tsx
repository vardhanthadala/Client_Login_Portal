"use client"

import { useEffect, useRef } from "react"
import { useNotificationsStore } from "@/store/notificationsStore"

interface NotificationSyncProps {
  role: "ADMIN" | "CLIENT"
  data: any
  adminUserId?: string
}

export default function NotificationSync({ role, data, adminUserId }: NotificationSyncProps) {
  const { fetchNotifications, isLoaded } = useNotificationsStore()
  const hasSynced = useRef(false)
  const prevDataStr = useRef("")

  // Initial fetch of persisted notifications from DB
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Poll for new notifications every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications()
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Generate DB notifications from data changes (new messages, approvals, invoices)
  useEffect(() => {
    const currentDataStr = JSON.stringify(data)
    if (prevDataStr.current === currentDataStr) return
    prevDataStr.current = currentDataStr

    // Only generate notifications server-side through the sync endpoint
    const generateNotifications = async () => {
      try {
        await fetch('/api/notifications/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, data, adminUserId }),
        })
        // Refresh store after sync
        await fetchNotifications()
      } catch (err) {
        console.error('Failed to sync notifications:', err)
      }
    }

    generateNotifications()
  }, [data, role, adminUserId, fetchNotifications])

  return null
}
