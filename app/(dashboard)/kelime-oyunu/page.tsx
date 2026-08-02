import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { KelimeClient } from "./kelime-client";
import { Gamepad2, Sparkles, Trophy } from "lucide-react";

export const metadata = {
  title: "Günlük Kodlama Kelime Oyunu | CodeTR",
  description: "Her gün 1 yazılım terimini 6 tahminde bul, +50 XP kazan!",
};

export default async function WordlePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold shadow-lg">
          <Gamepad2 className="w-4 h-4 text-purple-400" /> Günlük Code Wordle Oyunu
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Günün <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Yazılım Terimi</span>
        </h1>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          5 Harfli günün yazılım terimini 6 denemede tahmin et. Doğru yerleşen harfler yeşil, var olanlar sarı renkle gösterilir!
        </p>
      </div>

      <KelimeClient />
    </div>
  );
}
