import { create } from 'zustand'

export type NotificationType = 'message' | 'approval' | 'project' | 'system'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  isRead: boolean
  link?: string
}

interface NotificationsState {
  notifications: AppNotification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void
}

const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'New Message from D-Team',
    message: 'We have updated the design assets for your review.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isRead: true,
    link: 'messages'
  },
  {
    id: 'n2',
    type: 'approval',
    title: 'Approval Required',
    message: 'The Homepage Wireframes are awaiting your approval.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: true,
    link: 'approvals'
  },
  {
    id: 'n3',
    type: 'project',
    title: 'Project Update',
    message: 'Your project "Website Redesign" has moved to the Development phase.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    link: 'projects'
  }
]

export const useClientNotifications = create<NotificationsState>((set) => ({
  notifications: mockNotifications,
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
  
  addNotification: (newNotif) => set((state) => ({
    notifications: [
      {
        ...newNotif,
        id: `n${Date.now()}`,
        createdAt: new Date().toISOString(),
        isRead: false
      },
      ...state.notifications
    ]
  }))
}))
