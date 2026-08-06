"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code2, LayoutDashboard, BookOpen, Trophy, 
  Medal, User, Settings, Flame, X, ChevronLeft, ChevronRight, Key, ShieldCheck, Award
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (collapsed: boolean) => void;
}

export function DashboardSidebar({ 
  isOpen, 
  setIsOpen, 
  isDesktopCollapsed, 
  setIsDesktopCollapsed 
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: "Panel", href: "/panel", icon: LayoutDashboard },
    { name: "Kurslar", href: "/kurslar", icon: BookOpen },
    { name: "Alıştırmalar", href: "/alistirmalar", icon: Code2 },
    { name: "Cheatsheets", href: "/hile-sayfasi", icon: BookOpen },
    { name: "Kelime Oyunu", href: "/kelime-oyunu", icon: Medal },
    { name: "Günlük Görevler", href: "/gorevler", icon: Medal },
    { name: "Canlı Chat", href: "/mesajlar", icon: User },
    { name: "1v1 Düello", href: "/duello", icon: Trophy },
    { name: "Turnuva", href: "/turnuva", icon: Trophy },
    { name: "Yetenek Analizi", href: "/analiz", icon: Medal },
    { name: "Kod İstatistikleri", href: "/istatistik", icon: Medal },
    { name: "Kariyer & CV", href: "/kariyer", icon: User },
    { name: "Proje Stüdyosu", href: "/projeler", icon: Code2 },
    { name: "Pomodoro Odak", href: "/odak", icon: Settings },
    { name: "Sosyal Ağ", href: "/sosyal", icon: User },
    { name: "Favori Dersler", href: "/favoriler", icon: BookOpen },
    { name: "Etkinlikler", href: "/etkinlikler", icon: Medal },
    { name: "Market", href: "/market", icon: Trophy },
    { name: "Günlük Ödüller", href: "/odullerim", icon: Medal },
    { name: "Ligler", href: "/ligler", icon: Trophy },
    { name: "Liderlik", href: "/liderlik", icon: Trophy },
    { name: "Başarımlar", href: "/basarimlar", icon: Medal },
    { name: "Destek", href: "/destek", icon: Settings },
    { name: "Profil", href: "/profil", icon: User },
    { name: "Ayarlar", href: "/ayarlar", icon: Settings },
  ];

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const adminNavItems = [
    { name: "Anahtarlar", href: "/admin/keys", icon: Key },
    { name: "Destek Talepleri", href: "/admin/destek", icon: Key },
    { name: "Rozet Yönetimi", href: "/admin/rozetler", icon: Award },
    { name: "Admin Panel", href: "/admin", icon: ShieldCheck },
  ];

  // Stats from session
  const xp = (session?.user as any)?.xp || 0;
  const level = (session?.user as any)?.level || 1;
  const streak = (session?.user as any)?.currentStreak || 0;
  const nextLevelXp = level * 1000; // Simple formula for next level xp

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between p-4 h-16 shrink-0">
        <Link href="/panel" className="flex items-center gap-2 group min-w-max">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          {!isDesktopCollapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            >
              CodeTR
            </motion.span>
          )}
        </Link>
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
        >
          {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 py-4 shrink-0">
        <div className={cn("glass-card rounded-xl p-3 transition-all", isDesktopCollapsed ? "items-center flex flex-col" : "")}>
          <div className={cn("flex gap-3", isDesktopCollapsed ? "flex-col items-center" : "items-center")}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">
                  {level}
                </div>
              </div>
            </div>
            
            {!isDesktopCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name || "Kullanıcı"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden xp-bar">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 xp-bar-fill transition-all duration-500" 
                      style={{ width: `${(xp / nextLevelXp) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{xp} XP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
                isActive 
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              )}
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-blue-400" : "group-hover:text-white")} />
              
              {!isDesktopCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="font-medium truncate"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}

        {/* Admin Section — only for ADMIN role */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-white/5">
            {!isDesktopCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Admin
              </p>
            )}
            {adminNavItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
                    isActive
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-admin-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-yellow-400" : "group-hover:text-white")} />
                  {!isDesktopCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="font-medium truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>


      <div className="p-4 mt-auto shrink-0 border-t border-white/5">
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20",
          isDesktopCollapsed ? "justify-center flex-col" : "justify-between"
        )}>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 streak-fire" />
            {!isDesktopCollapsed && <span className="text-sm font-medium text-orange-400">Seri</span>}
          </div>
          <span className="text-sm font-bold text-white">{streak} Gün</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isDesktopCollapsed ? "80px" : "260px" }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-background/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-background/95 backdrop-blur-xl border-r border-white/10 z-50 lg:hidden glass-card"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
