import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatXP, getLevelFromXP, formatDate } from "@/lib/utils";
import {
  Trophy,
  Flame,
  BookOpen,
  Award,
  Calendar,
  Settings,
  Share2,
  Clock,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profilim | CodeTR" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
        take: 6,
      },
      enrollments: {
        include: {
          course: { select: { id: true, title: true, slug: true, icon: true, totalLessons: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) redirect("/giris");

  const { level: currentLevel, currentXP, requiredXP, progress: progressPercent } =
    getLevelFromXP(user.xp);

  const totalAchievements = await db.achievement.count();
  const lessonsCompleted = await db.lessonProgress.count({
    where: { userId, completed: true },
  });
  const challengesSolved = await db.codeSubmission.count({
    where: { userId, passed: true },
  });
  const recentActivity = await db.userActivity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Heatmap: 364 days from DB activity & completed lessons
  const since = new Date(Date.now() - 364 * 24 * 60 * 60 * 1000);
  const [completedLessonDates, submissionsDates] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId, completed: true, completedAt: { gte: since } },
      select: { completedAt: true },
    }),
    db.codeSubmission.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const activityMap = new Map<string, number>();

  for (const l of completedLessonDates) {
    if (l.completedAt) {
      const key = new Date(l.completedAt).toDateString();
      activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
    }
  }

  for (const s of submissionsDates) {
    const key = new Date(s.createdAt).toDateString();
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  }

  const heatmapData = Array.from({ length: 364 }, (_, i) => {
    const d = new Date(Date.now() - (363 - i) * 24 * 60 * 60 * 1000);
    return { date: d, count: activityMap.get(d.toDateString()) ?? 0 };
  });

  const levelLabels = ["Acemi", "Başlangıç", "Orta", "İleri", "Uzman", "Efsane"];
  const levelTitle = levelLabels[Math.min(Math.floor(currentLevel / 10), 5)];

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

        <div className="relative shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/10 bg-muted">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Profil"}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center gradient-bg text-white text-4xl font-bold">
                {user.name?.charAt(0) ?? "U"}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 gradient-bg text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-background">
            Sv. {currentLevel}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username ?? user.email?.split("@")[0]}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/profil/duzenle">
                  <Settings className="w-4 h-4 mr-2" />
                  Düzenle
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Paylaş
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl">
            {user.bio ?? "Henüz bir biyografi eklenmemiş."}
          </p>

          <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(user.createdAt)} tarihinde katıldı</span>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            {[
              { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: "Toplam XP", value: formatXP(user.xp) },
              { icon: <Flame className="w-5 h-5 text-orange-500 streak-fire" />, label: "Seri", value: `${user.currentStreak} Gün` },
              { icon: <BookOpen className="w-5 h-5 text-blue-400" />, label: "Kurslar", value: String(user.enrollments.length) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="glass-card rounded-lg px-4 py-2 flex items-center gap-2">
                {icon}
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* XP & Level */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Mevcut Seviye: {currentLevel}</h2>
                <p className="text-sm gradient-text font-medium">{levelTitle}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Sonraki Seviye: {currentLevel + 1}</p>
                <p className="text-xs text-muted-foreground">{currentXP} / {requiredXP} XP</p>
              </div>
            </div>
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="glass-card rounded-2xl p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Aktivite Haritası</h2>
            <div className="min-w-[700px]">
              <div className="flex gap-1">
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {heatmapData
                      .slice(weekIndex * 7, (weekIndex + 1) * 7)
                      .map((day, dayIndex) => {
                        let bg = "bg-muted";
                        if (day.count > 0) bg = "bg-blue-900/40";
                        if (day.count > 1) bg = "bg-blue-700/60";
                        if (day.count > 3) bg = "bg-blue-500";
                        if (day.count > 5) bg = "bg-blue-400";
                        return (
                          <div
                            key={dayIndex}
                            className={`w-3 h-3 rounded-sm ${bg} transition-colors hover:ring-1 ring-white/30`}
                            title={`${day.date.toLocaleDateString("tr-TR")}: ${day.count} aktivite`}
                          />
                        );
                      })}
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-center gap-2 mt-3 text-xs text-muted-foreground">
                <span>Az</span>
                {["bg-muted", "bg-blue-900/40", "bg-blue-700/60", "bg-blue-500", "bg-blue-400"].map(
                  (c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                )}
                <span>Çok</span>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-6">Kurslarım</h2>
            {user.enrollments.length > 0 ? (
              <div className="space-y-5">
                {user.enrollments.map((enr) => (
                  <div key={enr.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/kurslar/${enr.course.slug}`}
                        className="font-medium hover:text-blue-400 transition-colors"
                      >
                        {enr.course.icon} {enr.course.title}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(enr.progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all"
                        style={{ width: `${enr.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz bir kursa başlamadınız.</p>
                <Button className="mt-4 gradient-bg" asChild>
                  <Link href="/kurslar">Kursları Keşfet</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Achievements */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Başarımlar</h2>
              <span className="text-sm text-blue-400">
                {user.achievements.length} / {totalAchievements}
              </span>
            </div>
            {user.achievements.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {user.achievements.map((ua) => (
                  <div
                    key={ua.id}
                    className="flex flex-col items-center text-center group cursor-pointer"
                    title={ua.achievement.title}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mb-1 group-hover:border-blue-500 transition-all">
                      <span className="text-2xl">{ua.achievement.icon}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {ua.achievement.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Henüz başarım kazanmadınız.
              </p>
            )}
            <Link
              href="/basarimlar"
              className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-6 pt-4 border-t border-border"
            >
              Tüm Başarımları Gör
            </Link>
          </div>

          {/* Stats */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">İstatistikler</h2>
            <div className="space-y-3">
              {[
                { icon: <CheckCircle2 className="w-5 h-5" />, color: "text-blue-400 bg-blue-500/20", label: "Tamamlanan Ders", value: lessonsCompleted },
                { icon: <BrainCircuit className="w-5 h-5" />, color: "text-purple-400 bg-purple-500/20", label: "Çözülen Görev", value: challengesSolved },
                { icon: <Award className="w-5 h-5" />, color: "text-yellow-400 bg-yellow-500/20", label: "Kazanılan Altın", value: user.totalCoinsEarned },
              ].map(({ icon, color, label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Son Aktiviteler</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-muted mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.action}</p>
                      {activity.xpEarned > 0 && (
                        <p className="text-xs text-blue-400">+{activity.xpEarned} XP</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {activity.createdAt.toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Henüz aktivite yok.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
