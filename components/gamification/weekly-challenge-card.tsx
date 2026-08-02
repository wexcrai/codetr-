"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Coins, Star, Target } from "lucide-react";

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  endDate: Date;
  progress: number;
  target: number;
  difficulty: "KOLAY" | "ORTA" | "ZOR";
}

interface WeeklyChallengeCardProps {
  challenge: WeeklyChallenge;
  onStart?: () => void;
}

export function WeeklyChallengeCard({ challenge, onStart }: WeeklyChallengeCardProps) {
  
  const percentage = Math.min(Math.round((challenge.progress / challenge.target) * 100), 100);
  const isCompleted = challenge.progress >= challenge.target;

  // Calculate remaining days
  const remainingTime = challenge.endDate.getTime() - new Date().getTime();
  const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

  const diffColors = {
    KOLAY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    ORTA: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    ZOR: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col h-full relative overflow-hidden">
      {isCompleted && (
        <div className="absolute -right-12 top-6 bg-emerald-600 text-white text-xs font-bold py-1 px-12 rotate-45 z-10 shadow-lg">
          TAMAMLANDI
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", diffColors[challenge.difficulty])}>
          {challenge.difficulty}
        </span>
        
        {!isCompleted && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {remainingDays > 0 ? `${remainingDays} gün kaldı` : "Bugün bitiyor"}
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg text-slate-100 mb-2">{challenge.title}</h3>
      <p className="text-sm text-slate-400 mb-6 flex-grow">{challenge.description}</p>

      {/* Rewards */}
      <div className="flex items-center gap-4 mb-5 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
        <div className="text-xs text-slate-500 font-medium">Ödüller:</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm font-semibold text-blue-400">
            <Star className="w-4 h-4 fill-blue-400" />
            +{challenge.xpReward}
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
            <Coins className="w-4 h-4" />
            +{challenge.coinReward}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-auto">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-medium text-slate-300">İlerleme</span>
          <span className="text-slate-400">
            <span className={isCompleted ? "text-emerald-400 font-bold" : "text-white font-medium"}>
              {challenge.progress}
            </span>
             / {challenge.target}
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={cn(
              "h-full rounded-full relative",
              isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
            )}
          />
        </div>

        {!isCompleted && (
          <button 
            onClick={onStart}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700 flex justify-center items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Görevi Yap
          </button>
        )}
      </div>
    </div>
  );
}
