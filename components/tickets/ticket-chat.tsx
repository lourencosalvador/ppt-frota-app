"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { ChatMessage, MOCK_CHAT_HISTORY } from "@/app/lib/tickets/chat-types";
import InitialsAvatar from "@/components/ui/initials-avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TicketChatProps {
  ticketId: string;
  currentUserRole: "gestor" | "support" | "admin";
}

export function TicketChat({ ticketId, currentUserRole }: TicketChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_HISTORY);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      ticketId,
      senderId: "current-user",
      senderName: currentUserRole === "gestor" ? "Você (Gestor)" : "Você (Suporte)",
      senderRole: currentUserRole,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100/60 bg-zinc-50/50">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-5 py-4">
        <div>
          <div className="text-sm font-extrabold text-zinc-900">Chat do Ticket</div>
          <div className="mt-0.5 text-xs font-semibold text-zinc-500">{messages.length} mensagens</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => {
          const isMe = message.senderRole === currentUserRole;

          return (
            <div
              key={message.id}
              className={cn("flex max-w-[80%] items-end gap-2.5", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              {!isMe && <InitialsAvatar name={message.senderName} size={30} />}

              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm shadow-sm",
                  isMe
                    ? "rounded-br-sm bg-emerald-600 text-white"
                    : "rounded-bl-sm border border-zinc-100/60 bg-white text-zinc-700",
                )}
              >
                {!isMe && (
                  <div className="mb-1 text-[10px] font-extrabold text-zinc-400">{message.senderName}</div>
                )}
                <p className="whitespace-pre-wrap font-semibold leading-relaxed">{message.content}</p>
                <div className={cn("mt-1.5 text-right text-[10px]", isMe ? "text-emerald-200" : "text-zinc-400")}>
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-100 bg-white p-4">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5 transition-all focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 border-none bg-transparent px-2 text-sm font-semibold text-zinc-700 outline-none placeholder:text-zinc-400"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim()}
            className={cn(
              "h-9 w-9 shrink-0 rounded-xl transition-all",
              newMessage.trim()
                ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                : "bg-zinc-200 text-zinc-400",
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
