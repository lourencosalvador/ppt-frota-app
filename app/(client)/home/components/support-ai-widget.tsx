"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";

export default function SupportAIWidget({
  open,
  onOpenChange,
  name,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
}) {
  const firstName = useMemo(() => name.trim().split(/\s+/)[0] || "Cliente", [name]);
  const [value, setValue] = useState("");

  const listRef = useRef<HTMLDivElement | null>(null);

  function messageText(m: unknown) {
    const anyMsg = m as any;
    const parts = anyMsg?.parts;
    if (Array.isArray(parts)) {
      return parts
        .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
        .map((p: any) => p.text)
        .join("");
    }
    if (typeof anyMsg?.content === "string") return anyMsg.content;
    if (typeof anyMsg?.text === "string") return anyMsg.text;
    return "";
  }

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/support" }), []);

  const initialMessages: UIMessage[] = useMemo(
    () => [
      {
        id: "m1",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Olá ${firstName}! Sou o Assistente Virtual da Frota+. Detectei que solicitou suporte urgente.`,
          },
        ],
      },
      {
        id: "m2",
        role: "assistant",
        parts: [
          {
            type: "text",
            text:
              "Como posso ajudar agora? (Ex: 'Cartão recusado', 'Onde fica o posto mais próximo', 'Esqueci o PIN')",
          },
        ],
      },
    ],
    [firstName],
  );

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
  } = useChat({
    transport,
    messages: initialMessages,
  });

  const isThinking = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [open, messages.length]);

  useEffect(() => {
    if (!open) {
      stop();
    }
  }, [open, stop]);

  useEffect(() => {
    if (!open) return;
    setMessages(initialMessages);
    setValue("");
  }, [open, initialMessages, setMessages]);

  async function submit() {
    const text = value.trim();
    if (!text) return;
    setValue("");
    await sendMessage({ text });
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="support-ai-widget"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-6 right-6 z-40 w-[92vw] max-w-[420px]"
        >
          <div className="flex h-[640px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="relative flex items-center justify-between gap-4 bg-gradient-to-b from-[#0B1220] to-[#0E2236] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-200">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-white">
                    Suporte IA Frota+
                  </div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/55">
                    RESPOSTA IMEDIATA
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-auto px-5 py-5">
              {messages.map((m) =>
                m.role === "assistant" ? (
                  <div
                    key={m.id}
                    className="max-w-[92%] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 shadow-sm"
                  >
                    {messageText(m)}
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[92%] rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm">
                      {messageText(m)}
                    </div>
                  </div>
                ),
              )}

              <AnimatePresence>
                {isThinking ? (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="max-w-[92%] rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
                    aria-label="A IA está a responder"
                  >
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                          animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.12,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="border-t border-zinc-100 bg-white px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Descreva a urgência..."
                  className="h-12 flex-1 rounded-2xl border border-blue-300 bg-white px-4 text-sm font-semibold text-zinc-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                  aria-label="Enviar"
                  disabled={!value.trim() || status !== "ready"}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

