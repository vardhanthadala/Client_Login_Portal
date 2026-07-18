"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2, Paperclip, Smile, CheckCheck, X } from "lucide-react"
import EmojiPicker from 'emoji-picker-react';
import { Button } from "@/components/ui/button"
import { getMessagesAction, sendMessageAction, markMessagesAsReadAction } from "@/app/actions/messages"
import { toast } from "sonner"
import Image from "next/image"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMessages()
    markMessagesAsReadAction(clientProfileId)
  }, [clientProfileId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
    <div className="flex flex-col h-[calc(100vh-72px)] w-full relative bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[16px] shadow-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="h-[72px] sm:h-[80px] shrink-0 px-6 sm:px-8 flex items-center bg-transparent z-10 border-b border-[#E2E8F0] dark:border-[#222]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#F1F5F9] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] flex items-center justify-center text-[#3454D1] font-bold text-xl">
            S
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-[16px] text-[#0F172A] dark:text-white">Support Team</h2>
            <span className="text-[13px] text-[#10B981] font-semibold flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10B981]" /> Online</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto hidden-scrollbar px-6 sm:px-8 py-6 space-y-6 z-10 bg-[#F8FAFC] dark:bg-[#0A0A0A]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3454D1]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 bg-[#F1F5F9] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-sm text-[#3454D1]">
              <Send className="w-8 h-8 ml-1" />
            </div>
            <p className="text-[#64748B] font-medium max-w-[200px]">No messages yet. Say hello to start the conversation!</p>
          </div>
        ) : (
          <>
            {/* Date divider mock */}
            <div className="flex justify-center my-6">
              <span className="bg-white dark:bg-[#1A1A1A] px-4 py-1.5 rounded-full text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#333]">
                Today
              </span>
            </div>
            
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId
              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex max-w-[85%] sm:max-w-[60%] flex-col relative group`}>
                    <div
                      className={`px-5 py-3.5 text-[14px] leading-relaxed transition-all duration-200 ${isMe
                          ? 'bg-[#3454D1] text-white rounded-[16px] rounded-br-[4px] shadow-sm'
                          : 'bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] text-[#0F172A] dark:text-[#E2E8F0] rounded-[16px] rounded-bl-[4px] shadow-sm'
                        } ${msg.isOptimistic ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'}`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'text-[#E2E8F0]' : 'text-[#64748B]'}`}>
                        <span className="text-[11px] font-medium tracking-wide">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && !msg.isOptimistic && <CheckCheck className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#111111] border-t border-[#E2E8F0] dark:border-[#222] z-10 shrink-0 relative">
        
        {/* Attachment Pill Preview */}
        {attachedFile && (
          <div className="absolute bottom-[80px] left-8 bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] shadow-md rounded-[12px] p-3 flex items-center gap-4 z-20 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] dark:bg-[#222] flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-[#3454D1]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-white max-w-[150px] truncate">{attachedFile.name}</span>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#888]">{(attachedFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <button onClick={removeAttachment} className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
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

        <form onSubmit={handleSend} className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex items-center bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] rounded-[12px] pr-2 pl-4 sm:pl-6 h-12 sm:h-14 shadow-sm focus-within:ring-2 focus-within:ring-[#3454D1]/20 focus-within:border-[#3454D1]/30 transition-all">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-0 text-[14px] font-semibold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] font-normal focus:ring-0 outline-none h-full"
              disabled={isSending}
            />
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <Button
            type="submit"
            size="icon"
            className={`rounded-[12px] shrink-0 w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ${!content.trim() && !attachedFile ? 'bg-[#F1F5F9] dark:bg-[#222] text-[#94A3B8]' : 'bg-[#3454D1] hover:bg-[#2842A8] text-white shadow-sm'}`}
            disabled={(!content.trim() && !attachedFile) || isSending}
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 -ml-0.5 mt-0.5" />}
          </Button>
        </form>
      </div>
      
    </div>
  )
}

