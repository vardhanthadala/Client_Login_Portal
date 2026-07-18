"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2, Paperclip, Smile, CheckCheck, X, Trash2 } from "lucide-react"
import EmojiPicker from 'emoji-picker-react';
import { Button } from "@/components/ui/button"
import { getMessagesAction, sendMessageAction, markMessagesAsReadAction, deleteMessageAction } from "@/app/actions/messages"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ChatInterface({
  clientProfileId,
  currentUserId
}: {
  clientProfileId: string
  currentUserId: string
}) {
  const [messages, setMessages] = useState<any[]>([])
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const getAvatarSrc = (imagePath: string | null | undefined) => {
    if (!imagePath) return ""
    if (imagePath.startsWith("data:") || imagePath.startsWith("blob:") || imagePath.startsWith("/")) {
      return imagePath
    }
    return `/api/file?url=${encodeURIComponent(imagePath)}`
  }

  useEffect(() => {
    fetchMessages()
    markMessagesAsReadAction(clientProfileId)
  }, [clientProfileId])

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom()
    }
  }, [messages, isLoading])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      } else if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 150);
  }

  const fetchMessages = async () => {
    setIsLoading(true)
    const res = await getMessagesAction(clientProfileId)
    if (res.success && res.data) {
      setMessages(res.data)
    }
    setIsLoading(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !attachedFile || isSending) return

    const tempId = `temp-${Date.now()}`
    const newMessage = {
      id: tempId,
      content,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    }

    setMessages((prev) => [...prev, newMessage])
    setContent("")
    setIsSending(true)

    const res = await sendMessageAction(clientProfileId, newMessage.content)
    if (res.success && res.data) {
      setMessages((prev) => prev.map(m => m.id === tempId ? res.data : m))
      removeAttachment() // Clear attachment on send
    } else {
      // Revert if failed
      setMessages((prev) => prev.filter(m => m.id !== tempId))
      toast.error(res.error || "Failed to send message")
      setContent(newMessage.content) // restore input
    }
    setIsSending(false)
  }

  const handleDeleteMessage = async (messageId: string) => {
    // Optimistic delete
    const previousMessages = [...messages]
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    const res = await deleteMessageAction(messageId, clientProfileId)
    if (!res?.success) {
      toast.error(res?.error || "Failed to delete message")
      setMessages(previousMessages) // Revert on failure
    }
  }

  const onEmojiClick = (emojiObject: any) => {
    setContent(prev => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0])
    }
  }

  const removeAttachment = () => {
    setAttachedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col h-full w-full relative bg-gradient-to-br from-[#f4f7fb] via-white to-[#eef2f7] dark:from-[#0b0d12] dark:via-[#0a0a0a] dark:to-[#111318] rounded-[24px] overflow-hidden border border-slate-200 dark:border-[#222]">
      
      {/* Background container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0"></div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto hidden-scrollbar px-4 sm:px-8 py-4 sm:py-6 flex flex-col z-10 bg-transparent"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500/50" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-3 flex-1">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-200">
              <Send className="w-8 h-8 ml-1" />
            </div>
            <p className="text-[#64748B] font-medium max-w-[200px]">No messages yet. Say hello to start the conversation!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-[20px]" />
            <div className="flex flex-col space-y-6">
            {Object.entries(
              messages.reduce((groups: { [key: string]: any[] }, msg) => {
                const date = new Date(msg.createdAt).toLocaleDateString()
                if (!groups[date]) groups[date] = []
                groups[date].push(msg)
                return groups
              }, {})
            ).map(([dateString, msgs]) => {
              const today = new Date().toLocaleDateString()
              const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
              let label = dateString
              if (dateString === today) label = "Today"
              else if (dateString === yesterday) label = "Yesterday"
              else label = new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

              return (
                <div key={dateString} className="space-y-6">
                  {/* Date divider */}
                  <div className="flex items-center justify-center my-6">
                    <span className="px-3 py-1 text-[11px] font-bold text-slate-500 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50 dark:border-white/5">
                      {label}
                    </span>
                  </div>
                  
                  {msgs.map((msg) => {
              const isMe = msg.senderId === currentUserId
              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden border border-white dark:border-[#222] shadow-sm">
                       {msg.sender?.image ? (
                         <img 
                           src={getAvatarSrc(msg.sender.image)} 
                           alt="Profile" 
                           className="w-full h-full object-cover" 
                         />
                       ) : (
                         <img 
                           src={`https://i.pravatar.cc/150?u=${isMe ? currentUserId : msg.senderId}`} 
                           alt="Profile" 
                           className="w-full h-full object-cover" 
                           onError={(e) => {
                             // Fallback if image fails to load
                             (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${isMe ? 'ME' : 'CL'}&background=random`
                           }}
                         />
                       )}
                    </div>

                    <div className="flex flex-col relative group/message">
                      <div
                        className={`px-5 py-3 text-[14.5px] leading-relaxed transition-all duration-200 ${isMe
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-[22px] rounded-br-[4px] shadow-md shadow-blue-500/20'
                            : 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#E2E8F0] rounded-[22px] rounded-bl-[4px] shadow-sm border border-slate-100 dark:border-transparent'
                          } ${msg.isOptimistic ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'}`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* Delete Button (visible on hover) */}
                      <button 
                        onClick={() => setMessageToDelete(msg.id)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-10' : '-right-10'} p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover/message:opacity-100 transition-opacity bg-white dark:bg-[#111] rounded-full shadow-sm border border-slate-100 dark:border-[#333] z-10`}
                        title="Delete for everyone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Time below bubble */}
                      <div className={`flex items-center mt-1 ${isMe ? 'justify-end text-slate-400' : 'justify-start text-slate-400'}`}>
                        <span className="text-[10px] font-medium tracking-wide">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
            )
          })}
            </div>
          </>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-transparent z-10 shrink-0 relative">
        
        {/* Attachment Pill Preview */}
        {attachedFile && (
          <div className="absolute bottom-[80px] left-8 bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] shadow-md rounded-xl p-3 flex items-center gap-4 z-20 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-slate-200 max-w-[150px] truncate">{attachedFile.name}</span>
              <span className="text-[11px] font-medium text-[#64748B]">{(attachedFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <button onClick={removeAttachment} className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-[80px] right-4 sm:right-24 z-20 shadow-xl rounded-[16px] animate-in fade-in slide-in-from-bottom-2">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3 bg-white dark:bg-[#1A1D24] rounded-[24px] border border-slate-200/80 dark:border-[#333] pl-5 pr-2 py-2 shadow-[0_5px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_5px_20px_rgba(0,0,0,0.4)] relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          
          <div className="flex-1 flex items-center">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write Something..."
              className="flex-1 bg-transparent border-0 text-[14.5px] text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:ring-0 outline-none h-11"
              disabled={isSending}
            />
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-[#333] pl-2 mr-2">
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-[#222] transition-colors"
            >
              <Smile className="w-4.5 h-4.5" />
            </button>
          </div>
          
          <Button
            type="submit"
            size="icon"
            className={`rounded-full shrink-0 w-11 h-11 transition-all duration-300 ${!content.trim() && !attachedFile ? 'bg-[#E2E8F0] text-[#94A3B8] dark:bg-[#222] dark:text-slate-500' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'}`}
            disabled={(!content.trim() && !attachedFile) || isSending}
          >
            {isSending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5 -ml-0.5 mt-0.5" />}
          </Button>
        </form>
      </div>
      
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent className="max-w-[360px] rounded-[24px] border border-slate-100 dark:border-[#222] p-6 shadow-2xl dark:bg-[#111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete message?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              This message will be deleted for everyone in this chat. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#222]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (messageToDelete) {
                  handleDeleteMessage(messageToDelete)
                  setMessageToDelete(null)
                }
              }}
              className="rounded-xl bg-red-500 text-white hover:bg-red-600 dark:bg-red-500/90 dark:hover:bg-red-500"
            >
              Delete for Everyone
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

