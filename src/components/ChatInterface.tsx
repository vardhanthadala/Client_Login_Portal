"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { getMessagesAction, sendMessageAction, markMessagesAsReadAction } from "@/app/actions/messages"
import { toast } from "sonner"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    if (!content.trim() || isSending) return

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
    } else {
      // Revert if failed
      setMessages((prev) => prev.filter(m => m.id !== tempId))
      toast.error(res.error || "Failed to send message")
      setContent(newMessage.content) // restore input
    }
    setIsSending(false)
  }

  return (
    <Card className="flex flex-col h-[600px] hover:border-primary/50 transition-all duration-200 overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/50 shrink-0">
        <CardTitle className="text-lg font-sans font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
          Messages
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 hidden-scrollbar">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#5A52FF]/50" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Send className="w-8 h-8 text-[#cbd5e1] ml-1" />
            </div>
            <p className="text-[#64748B] font-medium max-w-[200px]">No messages yet. Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex max-w-[85%] sm:max-w-[75%] flex-col relative group ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-4 py-2.5 text-[15px] leading-relaxed transition-all duration-200 ${isMe
                        ? 'bg-gradient-to-br from-[#5A52FF] to-[#4338CA] text-white rounded-[20px] rounded-br-[4px] shadow-sm'
                        : 'bg-[#F1F5F9] text-[#1E293B] rounded-[20px] rounded-bl-[4px]'
                      } ${msg.isOptimistic ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'}`}
                  >
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider text-[#94A3B8] mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} className="h-2" />
      </CardContent>

      <CardFooter className="border-t border-border/50 p-4 shrink-0">
        <form onSubmit={handleSend} className="flex w-full items-center gap-2 bg-muted/30 border border-border rounded-full p-1.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[15px] px-4 h-11"
            disabled={isSending}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className={`rounded-full shrink-0 w-11 h-11 transition-all duration-300 ${!content.trim() ? 'bg-[#E2E8F0] text-[#94A3B8]' : 'bg-[#5A52FF] hover:bg-[#4338CA] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}
            disabled={!content.trim() || isSending}
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
