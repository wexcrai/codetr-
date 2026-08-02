"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn, getLevelColor, getLevelTitle } from "@/lib/utils";

interface XPBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  animated?: boolean;
  className?: string;
}

export function XPBar({
  currentXP,
  requiredXP,
  level,
  animated = true,
  className,
}: XPBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate percentage
    const percentage = Math.min(Math.max((currentXP / requiredXP) * 100, 0), 100);
    if (animated) {
      const timer = setTimeout(() => setProgress(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setProgress(percentage);
    }
  }, [currentXP, requiredXP, animated]);

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg text-white",
              getLevelColor ? getLevelColor(level) : "bg-gradient-to-r from-blue-500 to-purple-500"
            )}
          >
            {level}
          </div>
          <span className="text-sm font-medium text-slate-300">
            {getLevelTitle ? getLevelTitle(level) : "Seviye"}
          </span>
        </div>
        <div className="text-sm font-semibold">
          <span className="text-blue-400">{currentXP.toLocaleString()}</span>
          <span className="text-slate-500"> / {requiredXP.toLocaleString()} XP</span>
        </div>
      </div>
      
      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 rounded-full relative"
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/20 blur-sm rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
