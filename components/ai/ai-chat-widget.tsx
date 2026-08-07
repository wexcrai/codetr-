"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, X, Send, Loader2, Sparkles, 
  RefreshCw, Copy, Check, ChevronDown,
  Zap, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  timestamp: Date;
}

type Provider = "gemini" | "openai";

const PROVIDER_CONFIG = {
  gemini: {
    name: "Gemini",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    badge: "Google",
  },
  openai: {
    name: "GPT-4o",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    badge: "OpenAI",
  },
};

// Simple inline code block renderer
function MessageContent({ content }: { content: string }) {
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedBlock(index);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-sm leading-relaxed space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const lines = part.slice(3, -3).split("\n");
          const lang = lines[0] || "code";
          const code = lines.slice(1).join("\n").trim();
          return (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-white/10">
                <span className="text-xs text-slate-400 font-mono">{lang}</span>
                <button
                  onClick={() => copyCode(code, i)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copiedBlock === i ? (
                    <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Kopyalandı</span></>
                  ) : (
                    <><Copy className="w-3 h-3" /><span>Kopyala</span></>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 text-xs overflow-x-auto font-mono whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          );
        }

        // Render inline code with backticks
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <span key={i}>
            {inlineParts.map((ip, j) => {
              if (ip.startsWith("`") && ip.endsWith("`")) {
                return (
                  <code key={j} className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-xs">
                    {ip.slice(1, -1)}
                  </code>
                );
              }
              // Handle **bold**
              const boldParts = ip.split(/(\*\*[^*]+\*\*)/g);
              return boldParts.map((bp, k) => {
                if (bp.startsWith("**") && bp.endsWith("**")) {
                  return <strong key={k} className="text-white font-semibold">{bp.slice(2, -2)}</strong>;
                }
                return <span key={k}>{bp}</span>;
              });
            })}
          </span>
        );
      })}
    </div>
  );
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Merhaba! 👋 Ben CodeTR'nin yapay zeka asistanıyım. Kodlama sorularında, hata ayıklamada veya kavramları anlamanda sana yardımcı olabilirim. Ne öğrenmek istiyorsun?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>("gemini");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        provider: data.provider,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Hata: ${err.message}. Lütfen tekrar deneyin.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Sohbet sıfırlandı! Yeni bir sorun mu var? 😊",
        timestamp: new Date(),
      },
    ]);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const currentProvider = PROVIDER_CONFIG[provider];
  const ProviderIcon = currentProvider.icon;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:shadow-blue-500/50 hover:shadow-xl transition-shadow"
          >
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[580px] flex flex-col rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentProvider.color} flex items-center justify-center`}>
                  <ProviderIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Asistan</p>
                  <p className="text-xs text-slate-400">{currentProvider.badge} · {currentProvider.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Provider Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowProviderMenu(!showProviderMenu)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors border border-white/10"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{currentProvider.name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {showProviderMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        {(Object.entries(PROVIDER_CONFIG) as [Provider, typeof PROVIDER_CONFIG[Provider]][]).map(([key, cfg]) => {
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => { setProvider(key); setShowProviderMenu(false); }}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                                provider === key
                                  ? "bg-white/10 text-white"
                                  : "text-slate-400 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <div className={`w-5 h-5 rounded bg-gradient-to-br ${cfg.color} flex items-center justify-center`}>
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-xs">{cfg.name}</p>
                                <p className="text-[10px] text-slate-500">{cfg.badge}</p>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={resetChat}
                  title="Sohbeti sıfırla"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-purple-600"
                      : `bg-gradient-to-br ${currentProvider.color}`
                  )}>
                    {msg.role === "user" ? (
                      <span className="text-xs font-bold">S</span>
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    "group relative max-w-[80%] rounded-2xl px-3 py-2.5",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-sm"
                      : "bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-sm"
                  )}>
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <MessageContent content={msg.content} />
                    )}
                    {/* Copy button for assistant */}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="absolute -bottom-5 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {copiedMsgId === msg.id ? (
                          <><Check className="w-2.5 h-2.5 text-green-400" /><span className="text-green-400">Kopyalandı</span></>
                        ) : (
                          <><Copy className="w-2.5 h-2.5" /><span>Kopyala</span></>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentProvider.color} flex items-center justify-center`}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                {["Kod nasıl yazılır?", "React nedir?", "Hatamı düzelt"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-slate-900/80 shrink-0">
              <div className="flex items-end gap-2 bg-slate-800/80 rounded-xl border border-white/10 px-3 py-2 focus-within:border-blue-500/50 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Kodlama sorun? Sormaktan çekinme..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none max-h-28 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
                  style={{ minHeight: "24px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "p-1.5 rounded-lg transition-all shrink-0",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90"
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-600 mt-1.5">
                Enter ile gönder · Shift+Enter yeni satır
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for provider menu */}
      {showProviderMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProviderMenu(false)} />
      )}
    </>
  );
}
