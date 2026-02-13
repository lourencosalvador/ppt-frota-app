"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Image as ImageIcon, MoreVertical } from "lucide-react"
import { ChatMessage, ChatRole, MOCK_CHAT_HISTORY } from "@/app/lib/tickets/chat-types"
import InitialsAvatar from "@/components/ui/initials-avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button" // Assuming Button exists
import { Input } from "@/components/ui/input"   // Assuming Input exists

interface TicketChatProps {
  ticketId: string
  currentUserRole: "gestor" | "support" | "admin"
}

export function TicketChat({ ticketId, currentUserRole }: TicketChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_HISTORY)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      ticketId,
      senderId: "current-user",
      senderName: currentUserRole === "gestor" ? "Você (Gestor)" : "Você (Suporte)",
      senderRole: currentUserRole,
      content: newMessage,
      createdAt: new Date().toISOString(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 rounded-lg overflow-hidden border border-zinc-200">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Chat do Ticket</h3>
          <p className="text-xs text-zinc-500">
            {messages.length} mensagens
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMe = message.senderRole === currentUserRole
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2 max-w-[80%]",
                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {!isMe && (
                <InitialsAvatar 
                  name={message.senderName} 
                  className="h-8 w-8 text-[10px]" 
                />
              )}

              <div
                className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm relative group",
                  isMe 
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none" 
                    : "bg-white border border-zinc-100 text-zinc-700 rounded-bl-none"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <div 
                  className={cn(
                    "text-[10px] mt-1 text-right w-full",
                    isMe ? "text-emerald-100" : "text-zinc-400"
                  )}
                >
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-full border border-zinc-200 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-200 transition-all"
        >
          <div className="flex items-center gap-1 pl-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-full"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-full"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-700 placeholder:text-zinc-400 px-2"
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim()}
            className={cn(
              "h-8 w-8 rounded-full transition-all duration-200 shadow-sm",
              newMessage.trim() 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
