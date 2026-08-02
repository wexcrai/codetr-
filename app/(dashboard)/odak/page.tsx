import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OdakClient } from "./odak-client";
import { Timer, Zap, Flame, Brain, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pomodoro Odaklanma Sayacı | CodeTR",
  description: "25 dakikalık odaklanma oturumları ile verimli kod yaz.",
};

export default async function FocusPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold shadow-lg">
          <Timer className="w-4 h-4 text-cyan-400" /> Pomodoro Odaklanma Modu
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Odaklanma &amp; <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Pomodoro Sayacı</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          25 dakika kesintisiz kodlama, 5 dakika mola. Verimliliğinizi zirveye taşıyın!
        </p>
      </div>

      <OdakClient />
    </div>
  );
}
