import { create } from 'zustand'

export type NotificationType = 'MESSAGE' | 'APPROVAL' | 'INVOICE' | 'PROJECT' | 'SYSTEM'

export interface RealTimeNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  isRead: boolean
  link?: string
  clientName?: string
  clientId?: string
  sourceId?: string
  clientImage?: string | null
}

interface NotificationsState {
  notifications: RealTimeNotification[]
  isLoaded: boolean
  setNotifications: (notifications: RealTimeNotification[]) => void
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoaded: false,

  setNotifications: (newNotifications) => set({ notifications: newNotifications, isLoaded: true }),

  fetchNotifications: async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      set({ notifications: data.notifications || [], isLoaded: true })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  },

  markAsRead: async (id) => {
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    }))
    // Persist to DB
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  },

  markAllAsRead: async () => {
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true }))
    }))
    // Persist to DB
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  },
}))
