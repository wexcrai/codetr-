"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, Trophy, Star, Coins } from "lucide-react";

export type Rarity = "YAYGIN" | "NADIR" | "EPIK" | "EFSANEVI";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: Rarity;
  xpReward: number;
  coinReward: number;
  isSecret: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: Date;
  className?: string;
}

const rarityStyles: Record<Rarity, { border: string; bg: string; text: string; glow: string }> = {
  YAYGIN: { border: "border-slate-500", bg: "bg-slate-500/10", text: "text-slate-400", glow: "shadow-slate-500/20" },
  NADIR: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/20" },
  EPIK: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/20" },
  EFSANEVI: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400", glow: "shadow-yellow-500/40" },
};

export function AchievementCard({ achievement, unlocked, unlockedAt, className }: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const styles = rarityStyles[achievement.rarity];
  
  const isHidden = !unlocked && achievement.isSecret;

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.02, rotateY: 5, rotateX: -5 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative p-5 rounded-xl border transition-all duration-300 h-full flex flex-col",
        unlocked 
          ? `bg-slate-900/80 ${styles.border} ${isHovered ? `shadow-lg ${styles.glow}` : ""}` 
          : "bg-slate-900/40 border-slate-800 grayscale opacity-70",
        className
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {!unlocked && (
        <div className="absolute top-3 right-3 z-10">
          <Lock className="w-4 h-4 text-slate-500" />
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div 
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0",
            unlocked ? styles.bg : "bg-slate-800"
          )}
        >
          {isHidden ? "❓" : achievement.icon || "🏆"}
        </div>
        <div>
          <h4 className={cn("font-bold", unlocked ? "text-slate-200" : "text-slate-500")}>
            {isHidden ? "Gizli Başarım" : achievement.title}
          </h4>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block", unlocked ? `${styles.bg} ${styles.text}` : "bg-slate-800 text-slate-500")}>
            {achievement.rarity}
          </span>
        </div>
      </div>

      <p className={cn("text-sm flex-grow mb-4", unlocked ? "text-slate-400" : "text-slate-600")}>
        {isHidden ? "Bu başarımı açmak için oynamaya devam edin." : achievement.description}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
        <div className="flex gap-3">
          {achievement.xpReward > 0 && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", unlocked ? "text-blue-400" : "text-slate-600")}>
              <Star className="w-3 h-3" />
              +{achievement.xpReward} XP
            </div>
          )}
          {achievement.coinReward > 0 && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", unlocked ? "text-yellow-500" : "text-slate-600")}>
              <Coins className="w-3 h-3" />
              +{achievement.coinReward}
            </div>
          )}
        </div>
        {unlocked && unlockedAt && (
          <div className="text-[10px] text-slate-500">
            {new Date(unlockedAt).toLocaleDateString("tr-TR")}
          </div>
        )}
      </div>
    </motion.div>
  );
}
