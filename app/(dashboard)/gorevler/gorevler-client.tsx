'use client';

import { useState } from 'react';
import { Target, CheckCircle2, Zap, Coins, Sparkles, Loader2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GorevlerClientProps {
  user: any;
  lessonsCompletedToday: number;
}

export function GorevlerClient({ user, lessonsCompletedToday }: GorevlerClientProps) {
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const QUESTS = [
    {
      id: "q-1",
      title: "🎯 Günlük Öğrenim Maratonu",
      description: "Bugün en az 2 ders tamamla.",
      current: lessonsCompletedToday,
      target: 2,
      xp: 50,
      coins: 25,
      icon: "📚",
    },
    {
      id: "q-2",
      title: "⚔️ Düello Savaşçısı",
      description: "1v1 Kod Düellosuna katıl ve kodunu çalıştır.",
      current: 1,
      target: 1,
      xp: 75,
      coins: 35,
      icon: "⚔️",
    },
    {
      id: "q-3",
      title: "🧠 Algoritma Pratiği",
      description: "Alıştırmalar kısmından 1 algoritma sorusu çöz.",
      current: 1,
      target: 1,
      xp: 60,
      coins: 30,
      icon: "🧩",
    },
  ];

  const handleClaim = (questId: string) => {
    setLoadingId(questId);
    setTimeout(() => {
      setClaimedMap((prev) => ({ ...prev, [questId]: true }));
      setLoadingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Quests List */}
      <div className="space-y-4">
        {QUESTS.map((q) => {
          const isDone = q.current >= q.target;
          const isClaimed = claimedMap[q.id];

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md transition-all shadow-xl ${
                isClaimed
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isDone
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                  {q.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {q.title}
                    {isClaimed && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Alındı
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300">{q.description}</p>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-2 w-36 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {q.current} / {q.target}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rewards & Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-yellow-400">+{q.xp} XP</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400">+{q.coins} 🪙</span>
                </div>

                <button
                  onClick={() => handleClaim(q.id)}
                  disabled={!isDone || isClaimed || loadingId === q.id}
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                    isClaimed
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isDone
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:opacity-90 shadow-amber-500/20'
                      : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {loadingId === q.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : isClaimed ? (
                    'Tamamlandı'
                  ) : isDone ? (
                    'Ödülü Al 🎉'
                  ) : (
                    'Devam Ediyor'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
