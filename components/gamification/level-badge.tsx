"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn, getLevelColor, getLevelTitle } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
  showTitle?: boolean;
}

const sizeStyles = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-16 h-16 text-2xl border-4",
  xl: "w-24 h-24 text-4xl border-4",
};

export function LevelBadge({ 
  level, 
  size = "md", 
  animated = false, 
  className,
  showTitle = false 
}: LevelBadgeProps) {
  
  // Try to use utility, fallback to gradient
  let colorClass = "bg-gradient-to-br from-blue-500 to-purple-600";
  try {
    if (getLevelColor) colorClass = getLevelColor(level);
  } catch(e) {}

  let title = "Seviye";
  try {
    if (getLevelTitle) title = getLevelTitle(level);
  } catch(e) {}

  const badgeContent = (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/30 blur-md z-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center font-bold text-white rounded-full shadow-lg border-2 border-white/20",
            sizeStyles[size],
            colorClass,
            className
          )}
        >
          {level}
        </div>
      </div>
      
      {showTitle && size !== "sm" && (
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </span>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
}
