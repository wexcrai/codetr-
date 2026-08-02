import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, Code2, Clock, CheckCircle2, Flame, Award, Zap } from "lucide-react";

export const metadata = {
  title: "Gelişmiş Kod İstatistikleri | CodeTR",
  description: "Yazdığın toplam kod satırı, çalışma saati ve performans analitiğin.",
};

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [user, submissions, completedLessonsCount, achievementsCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, xp: true, level: true, coins: true, currentStreak: true, longestStreak: true, createdAt: true },
    }),
    db.codeSubmission.findMany({
      where: { userId },
      select: { code: true, createdAt: true },
    }),
    db.lessonProgress.count({
      where: { userId, completed: true },
    }),
    db.userAchievement.count({
      where: { userId },
    }),
  ]);

  // Compute Lines of Code
  const totalLinesOfCode = submissions.reduce((acc, sub) => acc + sub.code.split("\n").length, 0) + (completedLessonsCount * 12);
  const estimatedCodingHours = Math.round((completedLessonsCount * 10 + submissions.length * 5) / 60);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold shadow-lg">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Kişisel Gelişmiş Kod Analitiği
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Kodlama <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">İstatistiklerin</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Yazdığınız toplam kod satırları, aktif çalışma saatleriniz ve başarı metrikleriniz.
        </p>
      </div>

      {/* Main Metric Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-950/20 space-y-2 backdrop-blur-md shadow-xl">
          <Code2 className="w-8 h-8 text-blue-400" />
          <p className="text-xs text-slate-400">Yazılan Kod Satırı</p>
          <p className="text-3xl font-extrabold text-white font-mono">{totalLinesOfCode} <span className="text-xs font-sans text-blue-400 font-bold">Satır</span></p>
        </div>

        <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-2 backdrop-blur-md shadow-xl">
          <Clock className="w-8 h-8 text-purple-400" />
          <p className="text-xs text-slate-400">Tahmini Çalışma Süresi</p>
          <p className="text-3xl font-extrabold text-white font-mono">{estimatedCodingHours} <span className="text-xs font-sans text-purple-400 font-bold">Saat</span></p>
        </div>

        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-2 backdrop-blur-md shadow-xl">
          <CheckCircle2 className="w-8 h-8 text-amber-400" />
          <p className="text-xs text-slate-400">Tamamlanan Dersler</p>
          <p className="text-3xl font-extrabold text-white font-mono">{completedLessonsCount} <span className="text-xs font-sans text-amber-400 font-bold">Ders</span></p>
        </div>

        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2 backdrop-blur-md shadow-xl">
          <Flame className="w-8 h-8 text-emerald-400 streak-fire" />
          <p className="text-xs text-slate-400">En Uzun Seri</p>
          <p className="text-3xl font-extrabold text-white font-mono">{user?.longestStreak ?? 0} <span className="text-xs font-sans text-emerald-400 font-bold">Gün</span></p>
        </div>
      </div>
    </div>
  );
}
