"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

interface CoinsDisplayProps {
  coins: number;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CoinsDisplay({ coins, animated = true, className, onClick }: CoinsDisplayProps) {
  const [displayCoins, setDisplayCoins] = useState(0);

  useEffect(() => {
    if (!animated) {
      setDisplayCoins(coins);
      return;
    }

    let start = displayCoins;
    const end = coins;
    if (start === end) return;

    const duration = 1000;
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(start + (end - start) * easeProgress);
      
      setDisplayCoins(currentVal);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayCoins(end);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [coins, animated]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors group cursor-pointer",
        className
      )}
    >
      <motion.div
        animate={{
          rotateY: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 5
        }}
        className="relative"
      >
        <Coins className="w-5 h-5 text-yellow-500" />
        <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
      <span className="font-bold text-yellow-500 font-mono tracking-tight">
        {displayCoins.toLocaleString()}
      </span>
      <span className="text-xs text-yellow-600 font-semibold uppercase tracking-wider hidden sm:inline-block">
        Altın
      </span>
    </button>
  );
}
