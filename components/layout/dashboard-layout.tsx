"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { AIChatWidget } from "@/components/ai/ai-chat-widget";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Close mobile menu on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardSidebar 
        isOpen={mobileMenuOpen} 
        setIsOpen={setMobileMenuOpen} 
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
      />
      
      <DashboardHeader 
        onMenuClick={() => setMobileMenuOpen(true)} 
        isSidebarCollapsed={isDesktopCollapsed}
      />

      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          "lg:pl-[var(--sidebar-width)]"
        )}
        style={{
          '--sidebar-width': isDesktopCollapsed ? '80px' : '260px'
        } as React.CSSProperties}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* AI Chat Widget - floating on all dashboard pages */}
      <AIChatWidget />
    </div>
  );
}
