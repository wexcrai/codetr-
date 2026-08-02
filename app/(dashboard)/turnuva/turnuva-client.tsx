'use client';

import { useState } from 'react';
import { Trophy, Timer, Award, Sparkles, CheckCircle2, ShieldCheck, Users, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface TurnuvaClientProps {
  user: any;
  topCoders: any[];
}

export function TurnuvaClient({ user, topCoders }: TurnuvaClientProps) {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div className="space-y-8">
      {/* Active Tournament Card */}
      <div className="p-8 sm:p-10 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Left Info */}
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
            🔥 Başlamasına Az Kaldı
          </div>
          <h2 className="text-3xl font-extrabold text-white">Yaz Sezonu Şampiyonluk Ligi</h2>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            3 Aşamalı Algoritma &amp; Veri Yapıları yarışı. Turnuva süresince canlı sıralamada ilk 3'e giren yazılımcılara efsanevi VIP rozeti hediye edilir.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">1.lik Ödülü</span>
              <span className="font-bold text-yellow-400">🏆 2.500 XP + 🪙 1.000 Altın</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">2.lik Ödülü</span>
              <span className="font-bold text-slate-300">🥈 1.500 XP + 🪙 500 Altın</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">3.lük Ödülü</span>
              <span className="font-bold text-amber-500">🥉 1.000 XP + 🪙 250 Altın</span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center space-y-4 shrink-0 w-full md:w-64">
          <Timer className="w-8 h-8 text-yellow-400 animate-pulse" />
          <div>
            <p className="text-xs text-slate-400">Kalan Süre</p>
            <p className="text-xl font-mono font-extrabold text-white mt-1">02 Gün : 14 Saat</p>
          </div>

          <button
            onClick={() => setIsRegistered(true)}
            disabled={isRegistered}
            className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg ${
              isRegistered
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:opacity-90 shadow-amber-500/20'
            }`}
          >
            {isRegistered ? '✓ Turnuvaya Kaydolundu' : 'Turnuvaya Kaydol'}
          </button>
        </div>
      </div>

      {/* Leaderboard Competitors Table */}
      <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-2xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" /> Turnuva Katılımcı Sıralaması
        </h3>

        <div className="divide-y divide-white/5">
          {topCoders.map((coder, index) => (
            <div key={coder.id} className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <span className={`font-bold text-sm ${index === 0 ? 'text-yellow-400' : index < 3 ? 'text-slate-300' : 'text-slate-500'}`}>
                  #{index + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                  {coder.image ? <img src={coder.image} alt="" className="w-full h-full object-cover" /> : coder.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{coder.name || coder.username}</span>
                    {coder.equippedBadge && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {coder.equippedBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-purple-400">{coder.userTag}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-amber-400">{coder.xp} XP</span>
                <span className="text-[10px] text-slate-400 block">Seviye {coder.level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
