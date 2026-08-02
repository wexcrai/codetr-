"use client";

import { useState, useTransition } from "react";
import {
  Palette, Globe, Bell, Shield, Lock,
  Link as LinkIcon, Monitor, Moon, Sun, Smartphone,
  Key, CheckCircle2, AlertCircle, Loader2, Copy, Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { redeemKey } from "@/lib/actions/keys";
import { motion, AnimatePresence } from "framer-motion";

// ─── Key Redemption Component ─────────────────────────────────────────────────
function KeyRedemptionSection() {
  const [keyInput, setKeyInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format: uppercase, only A-Z0-9, add dashes at correct positions
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Prefix with CODETR if just starting
    let parts: string[] = [];
    if (raw.startsWith("CODETR")) {
      parts.push("CODETR");
      raw = raw.slice(6);
    }
    // Split remaining into groups of 4
    for (let i = 0; i < raw.length; i += 4) parts.push(raw.slice(i, i + 4));
    setKeyInput(parts.join("-").slice(0, 22)); // CODETR-XXXX-XXXX-XXXX = 22 chars
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput) return;
    setResult(null);
    startTransition(async () => {
      const res = await redeemKey(keyInput);
      setResult(res as any);
      if ((res as any).success) {
        toast.success("Anahtar başarıyla kullanıldı! 🎉");
        setKeyInput("");
      } else {
        toast.error((res as any).error || "Geçersiz anahtar.");
      }
    });
  };

  return (
    <section className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Erişim Anahtarı</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kurs erişimi, XP veya Altın kazanmak için anahtarını kullan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Anahtar Kodu</Label>
          <div className="relative">
            <input
              type="text"
              value={keyInput}
              onChange={handleKeyChange}
              placeholder="CODETR-XXXX-XXXX-XXXX"
              maxLength={22}
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-slate-900 border font-mono text-lg tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all",
                result?.success
                  ? "border-green-500/50 focus:ring-green-500/30"
                  : result && !result.success
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-blue-500/30 focus:border-blue-500/50"
              )}
            />
            {keyInput && (
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(keyInput); toast.success("Kopyalandı!"); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">Format: CODETR-XXXX-XXXX-XXXX</p>
        </div>

        <Button
          type="submit"
          disabled={isPending || !keyInput || keyInput.length < 18}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-yellow-500/10 disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Kontrol ediliyor...</>
          ) : (
            <><Key className="w-4 h-4 mr-2" /> Anahtarı Kullan</>
          )}
        </Button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.success ? "success" : "error"}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border",
                result.success
                  ? "bg-green-950/30 border-green-500/30 text-green-300"
                  : "bg-red-950/30 border-red-500/30 text-red-300"
              )}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {result.success ? "Anahtar Kullanıldı! 🎉" : "Hata"}
                </p>
                <p className="text-xs mt-0.5 opacity-80">
                  {result.success ? result.message : result.error}
                </p>
              </div>
              {result.success && (
                <Sparkles className="w-5 h-5 ml-auto text-yellow-400 animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {[
          { icon: "🎓", label: "Kurs Erişimi", desc: "Ücretli kurslara eriş" },
          { icon: "⚡", label: "XP Paketi", desc: "Bonus XP kazan" },
          { icon: "🪙", label: "Altın Paketi", desc: "Altın coin kazan" },
          { icon: "⭐", label: "Tam Erişim", desc: "Tüm içeriklere eriş" },
        ].map((item) => (
          <div key={item.label} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-xl">{item.icon}</span>
            <p className="text-sm font-medium text-white mt-1">{item.label}</p>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [fontSize, setFontSize] = useState([16]);

  const handleSave = () => {
    toast.success("Ayarlar başarıyla kaydedildi");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Ayarlar</h1>
        <p className="text-slate-400">Platform deneyiminizi kişiselleştirin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Sidebar nav */}
        <div className="hidden md:flex flex-col space-y-1">
          {[
            { icon: Palette, label: "Görünüm" },
            { icon: Globe, label: "Dil ve Bölge" },
            { icon: Bell, label: "Bildirimler" },
            { icon: Shield, label: "Güvenlik" },
            { icon: Key, label: "Anahtar" },
            { icon: LinkIcon, label: "Bağlı Hesaplar" },
          ].map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors",
                i === 0
                  ? "bg-blue-500/10 text-blue-400"
                  : "hover:bg-slate-800/50 text-slate-400"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-8">

          {/* Appearance */}
          <section className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Palette className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Görünüm</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-slate-300">Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: "light" as const, icon: Sun, label: "Açık" },
                    { val: "dark" as const, icon: Moon, label: "Koyu" },
                    { val: "system" as const, icon: Monitor, label: "Sistem" },
                  ].map(({ val, icon: Icon, label }) => (
                    <button
                      key={val}
                      onClick={() => setTheme(val)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                        theme === val
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                      )}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="text-slate-300">Editör Font Boyutu</Label>
                  <span className="text-sm text-blue-400">{fontSize[0]}px</span>
                </div>
                <Slider
                  defaultValue={[16]}
                  max={24}
                  min={12}
                  step={1}
                  value={fontSize}
                  onValueChange={setFontSize}
                  className="py-4"
                />
              </div>
            </div>
          </section>

          {/* Key Redemption */}
          <KeyRedemptionSection />

          {/* Security */}
          <section className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Güvenlik</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">İki Aşamalı Doğrulama (2FA)</h3>
                    <p className="text-sm text-slate-400 mt-1">Hesabınızı ekstra bir güvenlik katmanıyla koruyun.</p>
                  </div>
                </div>
                <Button variant="outline" disabled className="bg-slate-800 border-slate-700">
                  Yakında
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-white">Aktif Oturumlar</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Windows • Chrome</p>
                        <p className="text-xs text-slate-400">Şu anki cihazınız • İstanbul, TR</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">iOS • Safari</p>
                        <p className="text-xs text-slate-400">Dün 14:30 • İstanbul, TR</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8">Çıkış Yap</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Connected Accounts */}
          <section className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Bağlı Hesaplar</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">GitHub</h3>
                    <p className="text-sm text-slate-400">Bağlı</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 text-slate-300">Bağlantıyı Kes</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Google</h3>
                    <p className="text-sm text-slate-400">Bağlanmadı</p>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Bağla</Button>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[150px]"
            >
              Ayarları Kaydet
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
