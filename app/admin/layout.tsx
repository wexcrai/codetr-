import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  Trophy,
  Bell,
  BarChart3,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/giris");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/panel");
  }

  const navItems = [
    { href: "/admin", label: "Panel", icon: LayoutDashboard },
    { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
    { href: "/admin/kurslar", label: "Kurslar", icon: BookOpen },
    { href: "/admin/dersler", label: "Dersler", icon: FileText },
    { href: "/admin/sinavlar", label: "Sınavlar", icon: HelpCircle },
    { href: "/admin/basarimlar", label: "Başarımlar", icon: Trophy },
    { href: "/admin/bildirimler", label: "Bildirimler", icon: Bell },
    { href: "/admin/istatistikler", label: "İstatistikler", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AdminPanel</span>
          </Link>
          <div className="mt-6 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate w-32">{user.name}</span>
              <span className="text-xs text-purple-400 font-medium">{user.role}</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all hover:translate-x-1"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <Link
            href="/panel"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Platforma Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0f1c]">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
