"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Coins, Lock, Star } from "lucide-react";

interface DailyRewardCardProps {
  day: number;
  reward: { xp: number; coins: number };
  isClaimed: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onClaim?: () => void;
}

export function DailyRewardCard({
  day,
  reward,
  isClaimed,
  isCurrent,
  isLocked,
  onClaim
}: DailyRewardCardProps) {
  
  return (
    <motion.div
      whileHover={isCurrent ? { y: -5 } : {}}
      className={cn(
        "relative rounded-xl border p-4 flex flex-col items-center justify-between min-h-[140px] transition-all",
        isClaimed && "bg-slate-900/40 border-slate-800 opacity-60",
        isCurrent && "bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
        isLocked && "bg-slate-900/40 border-slate-800 opacity-40 grayscale"
      )}
    >
      {/* Day indicator */}
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Gün {day}
      </div>

      {/* Reward Icon & Amount */}
      <div className="flex flex-col items-center gap-2 my-2">
        {reward.coins > 0 ? (
          <div className="relative">
            <Coins className={cn("w-8 h-8", isCurrent ? "text-yellow-400" : "text-yellow-500/70")} />
            {isCurrent && (
              <motion.div
                className="absolute inset-0 bg-yellow-400 blur-xl opacity-30 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        ) : (
          <Star className={cn("w-8 h-8", isCurrent ? "text-blue-400 fill-blue-400" : "text-blue-500/70 fill-blue-500/30")} />
        )}
        
        <div className="font-bold font-mono">
          {reward.coins > 0 && <span className="text-yellow-500">+{reward.coins}</span>}
          {reward.xp > 0 && <span className="text-blue-400">+{reward.xp}</span>}
        </div>
      </div>

      {/* Status */}
      <div className="mt-2 w-full flex justify-center">
        {isClaimed && (
          <div className="bg-emerald-500/20 text-emerald-500 p-1 rounded-full">
            <Check className="w-4 h-4" />
          </div>
        )}
        
        {isLocked && (
          <div className="text-slate-500">
            <Lock className="w-4 h-4" />
          </div>
        )}

        {isCurrent && (
          <button 
            onClick={onClaim}
            className="w-full text-xs py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            Al
          </button>
        )}
      </div>
    </motion.div>
  );
}
