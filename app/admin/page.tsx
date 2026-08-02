import { db } from "@/lib/db";
import { Users, BookOpen, CheckCircle, Code, Star, Trophy, Activity, ArrowUpRight, ShieldCheck, Key } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Yönetici Paneli | CodeTR",
  description: "Platform genel durumu ve istatistikleri.",
};

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    totalUsers,
    totalLessons,
    totalCourses,
    totalSubmissions,
    activeUsersTodayGroup,
    totalXpAgg,
    newUsersThisWeek,
    totalCertificates,
    totalKeys,
    recentUsers,
    recentSubmissions,
  ] = await Promise.all([
    db.user.count(),
    db.lesson.count(),
    db.course.count(),
    db.codeSubmission.count(),
    db.lessonProgress.groupBy({
      by: ["userId"],
      where: { updatedAt: { gte: todayStart } },
    }),
    db.user.aggregate({
      _sum: { totalXpEarned: true },
    }),
    db.user.count({
      where: { createdAt: { gte: weekStart } },
    }),
    db.certificate.count(),
    db.accessKey.count({
      where: { status: "ACTIVE" },
    }),
    db.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, level: true, xp: true, createdAt: true },
    }),
    db.codeSubmission.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        challenge: { select: { title: true } },
      },
    }),
  ]);

  const activeUsersToday = activeUsersTodayGroup.length;
  const totalXpAwarded = totalXpAgg._sum.totalXpEarned ?? 0;

  const stats = [
    { label: "Toplam Kullanıcı", value: totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Toplam Ders", value: totalLessons, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Toplam Kurs", value: totalCourses, icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Kod Gönderim", value: totalSubmissions, icon: Code, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Aktif Kullanıcı (Bugün)", value: activeUsersToday, icon: Activity, color: "text-rose-400", bg: "bg-rose-400/10" },
    { label: "Kazandırılan XP (Toplam)", value: totalXpAwarded, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Yeni Kayıt (Bu Hafta)", value: newUsersThisWeek, icon: ArrowUpRight, color: "text-teal-400", bg: "bg-teal-400/10" },
    { label: "Aktif Erişim Keys", value: totalKeys, icon: Key, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Yönetici Paneli</h1>
          <p className="text-slate-400 mt-1">Platformun gerçek zamanlı durumu ve canlı istatistikleri.</p>
        </div>
        <Link
          href="/admin/keys"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-bold text-white shadow-lg hover:opacity-90 transition-opacity text-sm"
        >
          <Key className="w-4 h-4" />
          Anahtar Yönetimi
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium text-sm">{stat.label}</span>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border border-white/5", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{stat.value.toLocaleString("tr-TR")}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Son Kayıt Olan Kullanıcılar</h2>
            <Link href="/admin/kullanicilar" className="text-xs text-blue-400 hover:underline font-medium">
              Tümünü Gör →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Kullanıcı</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Seviye</th>
                  <th className="px-4 py-3 rounded-tr-lg">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">
                      <div>{user.name || "İsimsiz"}</div>
                      <div className="text-xs text-slate-500 font-normal">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-semibold border", user.role === "ADMIN" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-slate-800 text-slate-300 border-slate-700")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-semibold text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Seviye {user.level}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {user.createdAt.toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Son Kod Gönderimleri</h2>
          {recentSubmissions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Henüz kod gönderimi bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white truncate max-w-[160px]">{sub.user.name || sub.user.email}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase", sub.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                      {sub.passed ? "BAŞARILI" : "HATA"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{sub.challenge.title}</p>
                  <p className="text-[10px] text-slate-500">{sub.createdAt.toLocaleDateString("tr-TR")} {sub.createdAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
