"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Coins } from "lucide-react";

export type NotificationType = "xp" | "coins" | "achievement";

export interface XPNotificationData {
  id: string;
  amount: number;
  type: NotificationType;
  message: string;
}

interface XPNotificationProps {
  notifications: XPNotificationData[];
  onRemove: (id: string) => void;
}

export function XPNotification({ notifications, onRemove }: XPNotificationProps) {
  
  useEffect(() => {
    // Auto-remove notifications after 3 seconds
    if (notifications.length > 0) {
      const timers = notifications.map(notif => 
        setTimeout(() => onRemove(notif.id), 3000)
      );
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [notifications, onRemove]);

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md rounded-lg p-3 flex items-center gap-4 min-w-[200px]"
          >
            <div className="flex-shrink-0">
              {notif.type === "xp" && (
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-400 fill-blue-400" />
                </div>
              )}
              {notif.type === "coins" && (
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-yellow-500" />
                </div>
              )}
              {notif.type === "achievement" && (
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-slate-300 font-medium">
                {notif.message}
              </span>
              <span className="font-bold text-lg font-mono">
                {notif.type === "xp" && <span className="text-blue-400">+{notif.amount} XP</span>}
                {notif.type === "coins" && <span className="text-yellow-500">+{notif.amount} 🪙</span>}
                {notif.type === "achievement" && <span className="text-purple-400">Açıldı!</span>}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
