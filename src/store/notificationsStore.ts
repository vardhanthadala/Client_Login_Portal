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
}

interface NotificationsState {
  notifications: RealTimeNotification[]
  setNotifications: (notifications: RealTimeNotification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  setNotifications: (newNotifications) => set((state) => {
    // Preserve local isRead state if it exists
    const merged = newNotifications.map(n => {
      const existing = state.notifications.find(en => en.id === n.id)
      return existing ? { ...n, isRead: existing.isRead } : n
    })
    return { notifications: merged }
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
}))
