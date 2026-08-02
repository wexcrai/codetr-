"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Lightbulb, Code2, HelpCircle, Eye, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiTutorProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  stepContent?: string;
  currentCode?: string;
  currentError?: string;
  language?: string;
}

// ─── Pre-built prompt templates ───────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: <Code2 className="w-3.5 h-3.5" />, label: "Kodu açıkla", color: "text-blue-400 border-blue-500/30 hover:bg-blue-500/10" },
  { icon: <HelpCircle className="w-3.5 h-3.5" />, label: "Neden hata alıyorum?", color: "text-red-400 border-red-500/30 hover:bg-red-500/10" },
  { icon: <Lightbulb className="w-3.5 h-3.5" />, label: "İpucu ver", color: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10" },
  { icon: <Eye className="w-3.5 h-3.5" />, label: "Çözüme yaklaştır", color: "text-purple-400 border-purple-500/30 hover:bg-purple-500/10" },
];

// ─── Simulated AI responses (production would call real API) ──────────────────

function generateAIResponse(userMessage: string, context: {
  lessonTitle?: string;
  stepContent?: string;
  currentCode?: string;
  currentError?: string;
}): string {
  const msg = userMessage.toLowerCase();
  const hasCode = !!context.currentCode?.trim();
  const hasError = !!context.currentError?.trim();

  if (msg.includes("açıkla") && hasCode) {
    return `Tabii! Kodunu inceledim:\n\n\`\`\`python\n${context.currentCode}\n\`\`\`\n\nBu kod şunu yapıyor:\n\n1. **Değişken tanımlamaları** — her satırda bir değer saklanıyor\n2. **İşlemler** — tanımlanan değerler üzerinde hesaplamalar yapılıyor\n3. **Çıktı** — print() ile sonuçlar ekrana yazdırılıyor\n\nHerhangi bir kısmı daha ayrıntılı açıklamamı ister misin? 😊`;
  }

  if (msg.includes("hata") || hasError) {
    if (hasError) {
      const errorLine = context.currentError?.split("\n")[0] ?? "";
      return `Hatanı gördüm! 🔍\n\n**Hata mesajı:**\n\`\`\`\n${errorLine}\n\`\`\`\n\n**Olası nedenler:**\n- Sözdizimi hatası (syntax error) — parantez, tırnak veya iki nokta eksik olabilir\n- Değişken tanımlanmadan kullanılmış olabilir\n- Girintileme (indentation) sorunu olabilir\n\n**Çözüm için:** Kodunu satır satır kontrol et, özellikle hata mesajında gösterilen satıra bak. Yardıma ihtiyacın olursa sor! 💪`;
    }
    return `Henüz bir hata görmüyorum. Kodu çalıştırıp aldığın hatayı paylaşırsan, birlikte inceleriz! 🔍`;
  }

  if (msg.includes("ipucu") || msg.includes("hint")) {
    const step = context.stepContent ?? "";
    return `İpucu zamanı! 💡\n\n**Bu adımda yapman gerekenler:**\n${step ? `- ${step.slice(0, 150)}...` : "- Dersin açıklamasını tekrar oku"}\n\n**Genel ipucu:**\nPython'da her şey basit! Önce sorunu parçalara böl:\n1. Ne girdi alıyorsun?\n2. Bununla ne yapman gerekiyor?\n3. Sonucu nasıl çıktı veriyorsun?\n\nAdım adım düşünmeye devam et, yaklaşıyorsun! 🚀`;
  }

  if (msg.includes("çözüm") || msg.includes("yaklaştır") || msg.includes("nasıl")) {
    return `Sana yardımcı olmak isterim ama çözümü direkt vermek yerine seni yönlendireyim! 🎯\n\n**Şu soruları sor kendine:**\n- Kodun girdisi ne olmalı?\n- Çıktının nasıl görünmesi gerekiyor?\n- Hangi Python kavramını kullanmalısın?\n\n**Genel yaklaşım:**\n\`\`\`python\n# 1. Gerekli değişkenleri tanımla\n# 2. İşlemleri yap\n# 3. Sonucu print() ile yazdır\n\`\`\`\n\nDenemeye devam et, bu şekilde daha iyi öğrenirsin! 💪`;
  }

  if (msg.includes("merhaba") || msg.includes("selam") || msg.includes("hi")) {
    return `Merhaba! 👋 Ben CodeTR'nin AI Tutor'uyum.\n\n**Sana nasıl yardımcı olabilirim?**\n- 🔍 Kodunu açıklayabilirim\n- 🐛 Hataları birlikte çözebiliriz\n- 💡 İpuçları verebilirim\n- 📚 Kavramları Türkçe açıklayabilirim\n\nSormak istediğin bir şey var mı? 😊`;
  }

  // Default helpful response
  return `Soru için teşekkürler! 🤔\n\n"${context.lessonTitle ?? "Bu ders"}" konusunda sana yardımcı olmak isterim.\n\nBiraz daha açar mısın? Örneğin:\n- Hangi kısımda takıldın?\n- Kodu çalıştırdığında ne oluyor?\n- Beklediğin çıktı ne?\n\nNe kadar çok bilgi versen, o kadar iyi yardımcı olabilirim! 💬`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiTutor({
  isOpen,
  onClose,
  lessonTitle,
  stepContent,
  currentCode,
  currentError,
  language = "python",
}: AiTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Merhaba! 👋 Ben **CodeTR AI Tutor**!\n\n"${lessonTitle ?? "Bu ders"}" konusunda sana yardımcı olmak için buradayım. Aşağıdaki hızlı seçenekleri kullanabilir veya doğrudan soru sorabilirsin!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay (500ms–1.5s)
    const delay = 500 + Math.random() * 1000;
    await new Promise((r) => setTimeout(r, delay));

    const aiResponse = generateAIResponse(content, {
      lessonTitle,
      stepContent,
      currentCode,
      currentError,
    });

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  }, [isTyping, lessonTitle, stepContent, currentCode, currentError]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Simple markdown-ish renderer
  const renderContent = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("```")) return null; // skip code fence markers
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-semibold text-white">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith("- ")) {
          return <li key={i} className="ml-4 list-disc text-slate-300">{renderInline(line.slice(2))}</li>;
        }
        if (/^\d+\. /.test(line)) {
          return <li key={i} className="ml-4 list-decimal text-slate-300">{renderInline(line.replace(/^\d+\. /, ""))}</li>;
        }
        if (line.startsWith("  ")) {
          return <code key={i} className="block font-mono text-xs text-green-400 bg-slate-950/60 px-2 py-0.5 rounded">{line.trim()}</code>;
        }
        if (!line.trim()) return <br key={i} />;
        return <p key={i} className="text-slate-300 leading-relaxed">{renderInline(line)}</p>;
      });
  };

  const renderInline = (text: string) => {
    // Bold
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={i} className="font-mono text-xs text-blue-300 bg-slate-950/60 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
      return part;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-80 flex flex-col bg-slate-900/95 border-l border-white/10 backdrop-blur-xl z-20 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-blue-900/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-1">
                  AI Tutor
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </p>
                <p className="text-xs text-slate-400">Her zaman buradayım</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-b border-white/5 shrink-0">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Hızlı Sorular</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => sendMessage(prompt.label)}
                  disabled={isTyping}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50",
                    prompt.color
                  )}
                >
                  {prompt.icon}
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5",
                  msg.role === "assistant"
                    ? "bg-gradient-to-tr from-purple-500 to-blue-500 text-white"
                    : "bg-blue-600 text-white"
                )}>
                  {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5" /> : "S"}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2.5 text-sm space-y-1",
                  msg.role === "assistant"
                    ? "bg-slate-800/80 border border-white/5 rounded-tl-sm"
                    : "bg-blue-600 text-white rounded-tr-sm"
                )}>
                  {msg.role === "assistant" ? (
                    <div className="space-y-1">{renderContent(msg.content)}</div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p className={cn(
                    "text-xs mt-1",
                    msg.role === "assistant" ? "text-slate-500" : "text-blue-200"
                  )}>
                    {msg.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2 items-start"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 shrink-0 bg-slate-950/50">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Soru sor... (Enter ile gönder)"
                rows={1}
                className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors max-h-28 overflow-y-auto custom-scrollbar"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 112) + "px";
                }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-9 w-9 shrink-0 bg-gradient-to-tr from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 text-center">
              Shift+Enter yeni satır • Enter gönder
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
