"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Code, 
  CheckCircle2, 
  Award, 
  Flame, 
  Star, 
  Coins, 
  GraduationCap 
} from "lucide-react";

export interface UserStats {
  lessonsCompleted: number;
  challengesSolved: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  totalCoins: number;
  coursesCompleted: number;
}

interface StatsGridProps {
  stats: UserStats;
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  const statItems = [
    {
      label: "Tamamlanan Ders",
      value: stats.lessonsCompleted,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Çözülen Görev",
      value: stats.challengesSolved,
      icon: Code,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Geçilen Quiz",
      value: stats.quizzesPassed,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Kusursuz Quiz",
      value: stats.perfectQuizzes,
      icon: Award,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
    {
      label: "Mevcut Seri",
      value: stats.currentStreak,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Toplam XP",
      value: stats.totalXP,
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Toplam Altın",
      value: stats.totalCoins,
      icon: Coins,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Bitirilen Kurs",
      value: stats.coursesCompleted,
      icon: GraduationCap,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={cn(
              "glass-card p-4 rounded-xl border flex flex-col gap-3",
              item.border
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-lg", item.bg)}>
                <Icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div className="text-xs font-medium text-slate-400 leading-tight">
                {item.label}
              </div>
            </div>
            
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {item.value.toLocaleString()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
