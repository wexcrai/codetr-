"use client";

import React, { useState } from "react";
import { Menu, Search, Bell, Zap, Coins, User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

export function DashboardHeader({ onMenuClick, isSidebarCollapsed }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const coins = (session?.user as any)?.coins || 0;
  const xp = (session?.user as any)?.xp || 0;
  const unreadNotifications = 0; // TODO: Fetch from db later

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-white/10 transition-all duration-300",
        // The padding left adjusts based on sidebar state in desktop
        "lg:pl-[var(--sidebar-width)]"
      )}
      style={{
        '--sidebar-width': isSidebarCollapsed ? '80px' : '260px'
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-white rounded-md hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ara (Cmd+K)..."
              className="w-64 h-9 pl-9 pr-4 text-sm bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5" title="XP">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">{xp}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5" title="CodeCoin">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{coins}</span>
            </div>
          </div>

          <button className="relative p-2 text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center hover:opacity-80 transition-opacity focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border border-white/10">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 glass-card"
                  >
                    <div className="p-4 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">{session?.user?.name || "Kullanıcı"}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{session?.user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link 
                        href="/dashboard/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profil
                      </Link>
                      <Link 
                        href="/dashboard/settings" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Ayarlar
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-white/10">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
