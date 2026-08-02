import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { HileClient } from "./hile-client";
import { BookOpen, FileCode, Zap, Sparkles } from "lucide-react";

export const metadata = {
  title: "Yazılımcı Cheatsheets & Kısayollar | CodeTR",
  description: "Python, JavaScript, SQL ve Git için hızlı hatırlatma kartları.",
};

export default async function CheatsheetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold shadow-lg">
          <FileCode className="w-4 h-4 text-yellow-400" /> Hızlı Kodlama Hatırlatma Rehberi
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Yazılımcı <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">Cheatsheet &amp; Kısayollar</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Python, JavaScript, SQL, CSS ve Git için en çok kullanılan söz dizimleri ve hazır kod şablonları.
        </p>
      </div>

      <HileClient />
    </div>
  );
}
