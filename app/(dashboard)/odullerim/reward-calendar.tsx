'use client';

import { useState } from 'react';
import { claimDailyReward } from '@/lib/actions/daily-rewards';
import { Check, Gift, Lock, Coins, Star, Sparkles, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardItem {
  day: number;
  coinReward: number;
  xpReward: number;
  specialReward?: string | null;
}

interface RewardCalendarProps {
  initialStreak: number;
  initialClaimedToday: boolean;
  initialCurrentDay: number;
  claimedDays: number[];
  rewards: RewardItem[];
}

export function RewardCalendar({
  initialStreak,
  initialClaimedToday,
  initialCurrentDay,
  claimedDays: initialClaimedDays,
  rewards,
}: RewardCalendarProps) {
  const [streak, setStreak] = useState(initialStreak);
  const [claimedToday, setClaimedToday] = useState(initialClaimedToday);
  const [claimedDays, setClaimedDays] = useState<number[]>(initialClaimedDays);
  const [isLoading, setIsLoading] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{ coins: number; xp: number; day: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const claimedSet = new Set(claimedDays);

  const handleClaim = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await claimDailyReward();
      if (res.success && res.coinReward && res.xpReward && res.day) {
        setClaimedToday(true);
        setStreak(res.streak ?? streak + 1);
        setClaimedDays((prev) => [...prev, res.day!]);
        setClaimedReward({ coins: res.coinReward, xp: res.xpReward, day: res.day });
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Ödül alınırken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Reward Claimed Popup / Banner */}
      <AnimatePresence>
        {claimedReward && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                  Tebrikler! Gün {claimedReward.day} Ödülü Hesabına Eklendi! 🎉
                </h3>
                <p className="text-sm text-slate-300">Harika bir seri yapıyorsun. Yarın tekrar gelmeyi unutma!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-300 font-bold text-sm border border-yellow-500/30 flex items-center gap-1">
                🪙 +{claimedReward.coins} Altın
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-sm border border-blue-500/30 flex items-center gap-1">
                <Star className="w-4 h-4" /> +{claimedReward.xp} XP
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
          {errorMessage}
        </div>
      )}

      {/* Grid of 30 days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {Array.from({ length: 30 }, (_, i) => {
          const dayNumber = i + 1;
          const isClaimed = claimedSet.has(dayNumber);
          const isCurrent = dayNumber === initialCurrentDay && !claimedToday;
          const isFuture = dayNumber > initialCurrentDay || (dayNumber === initialCurrentDay && claimedToday && !isClaimed);

          const rewardData = rewards.find((r) => r.day === dayNumber) || {
            day: dayNumber,
            coinReward: 10 + Math.floor(dayNumber / 5) * 5,
            xpReward: 20 + Math.floor(dayNumber / 3) * 10,
          };

          const isMilestone = dayNumber % 7 === 0;

          return (
            <div
              key={dayNumber}
              className={`
                relative p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300
                ${isClaimed ? 'bg-white/5 border-white/10 opacity-70' : ''}
                ${isCurrent ? 'bg-blue-950/60 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105 z-10' : ''}
                ${isFuture && !isClaimed ? 'bg-slate-900/40 border-white/5 opacity-50' : ''}
                ${isMilestone && !isClaimed ? 'border-amber-500/40 bg-amber-950/20' : ''}
              `}
            >
              {isClaimed && (
                <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 rounded-full p-1 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="text-xs font-semibold text-slate-400 mb-2">Gün {dayNumber}</div>

              {isMilestone ? (
                <Gift
                  className={`w-8 h-8 mb-2 ${
                    isClaimed
                      ? 'text-amber-500'
                      : isCurrent
                      ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-bounce'
                      : 'text-amber-700'
                  }`}
                />
              ) : (
                <Coins
                  className={`w-6 h-6 mb-2 ${
                    isClaimed
                      ? 'text-yellow-500'
                      : isCurrent
                      ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-bounce'
                      : 'text-yellow-700'
                  }`}
                />
              )}

              <div className="space-y-1">
                <div className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-1">
                  +{rewardData.coinReward} <Coins className="w-3 h-3" />
                </div>
                <div className="text-xs font-bold text-blue-400 flex items-center justify-center gap-1">
                  +{rewardData.xpReward} <Star className="w-3 h-3" />
                </div>
              </div>

              {isFuture && !isClaimed && (
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Button */}
      <div className="flex justify-center mt-8">
        {!claimedToday ? (
          <button
            onClick={handleClaim}
            disabled={isLoading}
            className="px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-500 via-purple-600 to-amber-500 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Gift className="w-6 h-6 animate-bounce" />
            )}
            <span>Bugünkü Ödülü Al</span>
          </button>
        ) : (
          <div className="px-8 py-4 rounded-2xl font-bold text-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-3 shadow-lg shadow-emerald-500/10">
            <Check className="w-6 h-6 text-emerald-400" />
            <span>Bugünkü Ödülünü Aldın! Yarın Görüşmek Üzere.</span>
          </div>
        )}
      </div>
    </div>
  );
}
