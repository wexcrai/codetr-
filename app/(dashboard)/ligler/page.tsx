import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trophy, Shield, Star, Flame, Sparkles, ChevronRight, Award } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Haftalık Ligler | CodeTR",
  description: "Yazılımcı liglerinde yarış, XP toplayarak Elmas Ligi'ne yüksel!",
};

export const LEAGUES = [
  { id: "bronze", name: "Tunç Ligi", minXp: 0, maxXp: 499, icon: "🥉", color: "from-amber-700 to-amber-900", border: "border-amber-700/40" },
  { id: "silver", name: "Gümüş Ligi", minXp: 500, maxXp: 1499, icon: "🥈", color: "from-slate-400 to-slate-600", border: "border-slate-400/40" },
  { id: "gold", name: "Altın Ligi", minXp: 1500, maxXp: 3499, icon: "🥇", color: "from-yellow-400 to-amber-500", border: "border-yellow-500/40" },
  { id: "diamond", name: "Elmas Ligi", minXp: 3500, maxXp: 999999, icon: "💎", color: "from-cyan-400 to-blue-600", border: "border-cyan-400/40" },
];

export default async function LeaguesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [user, topUsers] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { xp: true, name: true, image: true, level: true },
    }),
    db.user.findMany({
      orderBy: { xp: "desc" },
      take: 20,
      select: { id: true, name: true, username: true, xp: true, level: true, image: true },
    }),
  ]);

  const userXp = user?.xp ?? 0;
  const currentLeague = LEAGUES.find((l) => userXp >= l.minXp && userXp <= l.maxXp) || LEAGUES[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold shadow-lg">
          <Trophy className="w-4 h-4 text-cyan-400" /> CodeTR Haftalık Rekabet Ligleri
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Haftalık <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Ligler</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Ders çözerek XP topla, her hafta bir üst lige yüksel ve Elmas Ligi efsaneleri arasına adını yazdır!
        </p>
      </div>

      {/* User Current League Banner */}
      <div className={`p-8 rounded-3xl border ${currentLeague.border} bg-gradient-to-r ${currentLeague.color}/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden backdrop-blur-md`}>
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-4xl shadow-xl shrink-0">
            {currentLeague.icon}
          </div>
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Mevcut Liginiz</span>
            <h2 className="text-2xl font-extrabold text-white">{currentLeague.name}</h2>
            <p className="text-xs text-slate-300 mt-1">Mevcut Puanınız: <strong className="text-yellow-400">{userXp} XP</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Üst Lige Yükselme Bölgesi
          </span>
        </div>
      </div>

      {/* League Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LEAGUES.map((league) => {
          const isUserInLeague = currentLeague.id === league.id;

          return (
            <div
              key={league.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between backdrop-blur-md transition-all ${
                isUserInLeague
                  ? 'bg-blue-950/60 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)] scale-105 z-10'
                  : 'bg-white/5 border-white/10 opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="text-3xl">{league.icon}</div>
                <h3 className="text-lg font-bold text-white">{league.name}</h3>
                <p className="text-xs text-slate-400">{league.minXp} - {league.maxXp === 999999 ? '∞' : league.maxXp} XP</p>
              </div>

              {isUserInLeague && (
                <div className="mt-4 pt-3 border-t border-blue-500/30 text-xs font-bold text-blue-400 text-center">
                  ✓ Şu An Buradasınız
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* League Leaderboard Table */}
      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-md shadow-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> {currentLeague.name} Sıralaması (Canlı)
        </h3>

        <div className="divide-y divide-white/5">
          {topUsers.map((u, index) => {
            const rank = index + 1;
            const isCurrentUser = u.id === userId;
            const isPromotion = rank <= 5;

            return (
              <div
                key={u.id}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                  isCurrentUser ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-6 text-center font-bold text-sm ${rank === 1 ? 'text-yellow-400' : rank <= 3 ? 'text-slate-300' : 'text-slate-500'}`}>
                    #{rank}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                    {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm block">{u.name || u.username}</span>
                    <span className="text-[10px] text-slate-400">Seviye {u.level}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isPromotion && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Yükseliyor ⬆
                    </span>
                  )}
                  <span className="text-sm font-extrabold text-blue-400">{u.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
