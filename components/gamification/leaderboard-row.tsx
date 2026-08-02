"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Crown, Flame, Medal } from "lucide-react";
import { LevelBadge } from "./level-badge";

interface LeaderboardUser {
  id: string;
  name: string;
  image?: string | null;
  level: number;
  xp: number;
  streak: number;
}

interface LeaderboardRowProps {
  rank: number;
  user: LeaderboardUser;
  isCurrentUser?: boolean;
  delay?: number;
}

export function LeaderboardRow({ rank, user, isCurrentUser = false, delay = 0 }: LeaderboardRowProps) {
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300 fill-slate-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
      default:
        return <span className="text-lg font-bold text-slate-500 w-6 text-center">{rank}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-colors",
        isCurrentUser 
          ? "bg-blue-900/20 border border-blue-500/30" 
          : "bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50"
      )}
    >
      <div className="w-8 flex justify-center items-center shrink-0">
        {getRankIcon(rank)}
      </div>

      <div className="relative shrink-0">
        {user.image ? (
          <img 
            src={user.image} 
            alt={user.name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 font-bold text-slate-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute -bottom-2 -right-2">
          <LevelBadge level={user.level} size="sm" />
        </div>
      </div>

      <div className="flex-1 min-w-0 ml-2">
        <h4 className={cn(
          "font-semibold truncate",
          isCurrentUser ? "text-blue-400" : "text-slate-200"
        )}>
          {user.name} {isCurrentUser && "(Sen)"}
        </h4>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{user.xp.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
        <Flame className={cn("w-4 h-4", user.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-600")} />
        <span className={cn("font-medium", user.streak > 0 ? "text-slate-300" : "text-slate-600")}>
          {user.streak}
        </span>
      </div>
    </motion.div>
  );
}
