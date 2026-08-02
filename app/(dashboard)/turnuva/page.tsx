import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TurnuvaClient } from "./turnuva-client";
import { Trophy, Timer, Swords, Sparkles, Award, Users, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Büyük Ödüllü Turnuva & Hackathon | CodeTR",
  description: "CodeTR canlı kodlama turnuvasına katıl, büyük ödülleri kazan!",
};

export default async function TurnuvaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [user, topCoders] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, xp: true, level: true, coins: true },
    }),
    db.user.findMany({
      orderBy: { xp: "desc" },
      take: 10,
      select: { id: true, name: true, username: true, userTag: true, image: true, xp: true, level: true, equippedBadge: true },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-lg">
          <Trophy className="w-4 h-4 text-amber-400" /> Resmi Canlı Kodlama Turnuvası
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          CodeTR <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">Yaz Turnuvası 2026</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Zamana karşı algoritma problemlerini en hızlı çözen yazılımcı sen ol, **2.500 XP** ve **1.000 Altın** büyük ödülünü kap!
        </p>
      </div>

      <TurnuvaClient user={user} topCoders={topCoders} />
    </div>
  );
}
