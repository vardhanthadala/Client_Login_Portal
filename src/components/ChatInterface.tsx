"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { getMessagesAction, sendMessageAction, markMessagesAsReadAction } from "@/app/actions/messages"

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
      alert(res.error || "Failed to send message")
      setContent(newMessage.content) // restore input
    }
    setIsSending(false)
  }

  return (
    <Card className="flex flex-col h-[500px] border-border shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
        <CardTitle className="text-lg">Messages</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <p>No messages yet. Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground border border-border rounded-tl-sm'
                    } ${msg.isOptimistic ? 'opacity-70' : 'opacity-100'}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="border-t border-border/50 p-3 bg-muted/10">
        <form onSubmit={handleSend} className="flex w-full items-center gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-background"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={!content.trim() || isSending}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
