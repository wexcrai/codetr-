import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DuelloClient } from "./duello-client";
import { Swords, Trophy, Zap, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "1v1 Kod Düellosu (PVP) | CodeTR",
  description: "Zamana karşı 1v1 canlı kodlama düellosuna katıl, rakibini yen ve 100 XP kazan!",
};

export default async function DuelloPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, xp: true, level: true },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold shadow-lg">
          <Swords className="w-4 h-4 text-red-400" /> Canlı PVP Arenası
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          1v1 Canlı <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 bg-clip-text text-transparent">Kod Düellosu</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Rakibinle eşleş, 60 saniye içinde algoritma sorusunu ilk çözen sen ol ve **+100 XP &amp; +50 Altın** kazan!
        </p>
      </div>

      <DuelloClient user={user} />
    </div>
  );
}
