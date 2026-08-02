'use client';

import { useState } from 'react';
import { equipBadge } from '@/lib/actions/badges';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BadgeEquipClientProps {
  equippedBadge: string | null;
  badges: any[];
}

export function BadgeEquipClient({ equippedBadge: initialEquipped, badges }: BadgeEquipClientProps) {
  const [equipped, setEquipped] = useState<string | null>(initialEquipped);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEquip = async (badgeTitle: string) => {
    setLoadingId(badgeTitle);
    setFeedback(null);

    const isCurrent = equipped === badgeTitle;
    const targetTitle = isCurrent ? null : badgeTitle;

    try {
      const res = await equipBadge(targetTitle);
      if (res.success) {
        setEquipped(targetTitle);
        setFeedback({ type: 'success', text: res.message! });
      } else if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Rozet kuşanılırken bir hata oluştu.' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Equipped Badge Header */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-md flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 shrink-0">
            <Award className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Aktif Kuşanılan Unvan</span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              {equipped ? equipped : 'Henüz Bir Rozet Kuşanılmadı'}
            </h3>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="underline text-slate-400 hover:text-white">Kapat</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((b) => {
          const isEquipped = equipped === b.title;

          return (
            <div
              key={b.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 backdrop-blur-md transition-all shadow-xl ${
                isEquipped
                  ? 'bg-amber-950/40 border-amber-400 shadow-amber-500/10 scale-102'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{b.icon}</span>
                  {isEquipped && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 text-amber-400" /> Kuşanıldı
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-white">{b.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{b.description}</p>
              </div>

              <button
                onClick={() => handleEquip(b.title)}
                disabled={loadingId === b.title}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  isEquipped
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:opacity-90'
                }`}
              >
                {loadingId === b.title ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEquipped ? (
                  'Rozeti Çıkar'
                ) : (
                  'Rozeti Kuşan'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
