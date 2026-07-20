import { create } from 'zustand'

export interface Message {
  id: string
  clientProfileId: string
  senderId: string
  content: string
  createdAt: string | Date
  isRead: boolean
  sender?: {
    id: string
    role: string
    email: string
    image: string | null
    clientProfile: {
      clientName: string | null
      profileImageUrl: string | null
    } | null
  }
}

export interface AdminInfo {
  name: string | null
  image: string | null
}

interface MessageState {
  // Store messages and admin state indexed by clientProfileId
  messagesByProfile: Record<string, Message[]>
  adminStatusByProfile: Record<string, string>
  adminInfoByProfile: Record<string, AdminInfo | null>
  
  // Actions
  mergeMessages: (clientProfileId: string, incomingMessages: Message[]) => void
  addOptimisticMessage: (clientProfileId: string, message: Message) => void
  removeMessage: (clientProfileId: string, messageId: string) => void
  setAdminState: (clientProfileId: string, status: string, info: AdminInfo | null) => void
}

export const useMessageStore = create<MessageState>((set) => ({
  messagesByProfile: {},
  adminStatusByProfile: {},
  adminInfoByProfile: {},

  mergeMessages: (clientProfileId, incomingMessages) => {
    set((state) => {
      const existing = state.messagesByProfile[clientProfileId] || []
      
      console.log("MERGE_INPUT", incomingMessages.length)
      console.log("STORE_BEFORE", existing.length)

      // Create a map of existing messages for O(1) lookup
      const messageMap = new Map<string, Message>()
      existing.forEach(m => messageMap.set(m.id, m))
      
      // Merge incoming messages (this handles updates to read status, edits, etc)
      incomingMessages.forEach(incoming => {
        const existingMsg = messageMap.get(incoming.id)
        if (existingMsg) {
          // Update existing message fields
          messageMap.set(incoming.id, { ...existingMsg, ...incoming })
        } else {
          // Insert new message
          messageMap.set(incoming.id, incoming)
        }
      })
      
      // Convert back to array and sort chronologically by createdAt
      const mergedArray = Array.from(messageMap.values()).sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      console.log("STORE_AFTER", mergedArray.length)

      setTimeout(() => {
        console.log("STORE_STATE", useMessageStore.getState().messagesByProfile[clientProfileId]?.length)
      }, 0)

      return {
        messagesByProfile: {
          ...state.messagesByProfile,
          [clientProfileId]: mergedArray
        }
      }
    })
  },

  addOptimisticMessage: (clientProfileId, message) => {
    set((state) => {
      const existing = state.messagesByProfile[clientProfileId] || []
      return {
        messagesByProfile: {
          ...state.messagesByProfile,
          [clientProfileId]: [...existing, message]
        }
      }
    })
  },

  removeMessage: (clientProfileId, messageId) => {
    set((state) => {
      const existing = state.messagesByProfile[clientProfileId] || []
      return {
        messagesByProfile: {
          ...state.messagesByProfile,
          [clientProfileId]: existing.filter(m => m.id !== messageId)
        }
      }
    })
  },

  setAdminState: (clientProfileId, status, info) => {
    set((state) => ({
      adminStatusByProfile: {
        ...state.adminStatusByProfile,
        [clientProfileId]: status
      },
      adminInfoByProfile: {
        ...state.adminInfoByProfile,
        [clientProfileId]: info
      }
    }))
  }
}))
