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
  clearAllNotifications: () => Promise<void>
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
      
      const lastClearedTime = parseInt(localStorage.getItem('lastClearedTime') || '0', 10)
      const validNotifs = (data.notifications || []).filter((n: RealTimeNotification) => 
        new Date(n.createdAt).getTime() > lastClearedTime
      )
      
      set({ notifications: validNotifs, isLoaded: true })
    } catch (err) {
      // Ignore network errors during background polling to prevent Next.js error overlays
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

  clearAllNotifications: async () => {
    localStorage.setItem('lastClearedTime', Date.now().toString())
    set({ notifications: [] })
    
    // Also mark them as read in the backend so unread count is 0 on other devices
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
    } catch (err) {
      console.error('Failed to clear notifications on backend:', err)
    }
  },
}))
