"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, Star } from "lucide-react";

interface StreakCounterProps {
  streak: number;
  longestStreak: number;
  className?: string;
}

const MILESTONES = [7, 14, 30, 60, 100];

export function StreakCounter({ streak, longestStreak, className }: StreakCounterProps) {
  const [displayStreak, setDisplayStreak] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = streak;
    if (start === end) return;

    let totalDuration = 1500;
    let incrementTime = (totalDuration / end);

    let timer = setInterval(() => {
      start += 1;
      setDisplayStreak(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [streak]);

  return (
    <div className={cn("p-6 glass-card rounded-2xl border border-orange-500/20 bg-slate-900/50", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Günlük Seri</span>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [-5, 5, -5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Flame className="w-10 h-10 text-orange-500 fill-orange-500" />
            </motion.div>
            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              {displayStreak}
            </div>
            <span className="text-slate-300 font-medium">Gün</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">En uzun seri</div>
          <div className="text-sm font-bold text-slate-300 flex items-center justify-end gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            {longestStreak} Gün
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-400 mb-2">Kilometre Taşları</div>
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0" />
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full z-0"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((streak / Math.max(...MILESTONES)) * 100, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {MILESTONES.map((milestone) => {
            const isUnlocked = streak >= milestone;
            return (
              <div key={milestone} className="relative z-10 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300",
                    isUnlocked
                      ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      : "bg-slate-800 border-slate-700 text-slate-500"
                  )}
                >
                  {milestone}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
