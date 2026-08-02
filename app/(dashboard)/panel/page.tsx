import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { WeeklyChart } from './weekly-chart';
import Link from 'next/link';
import { Trophy, Coins, Flame, Star, Play, ChevronRight, Award, CheckCircle2 } from 'lucide-react';
import { formatXP, getLevelFromXP } from '@/lib/utils';

export const metadata = {
  title: 'Panel | CodeTR',
  description: 'Kişisel öğrenme paneli ve istatistiklerin.',
};

export default async function DashboardPanelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');

  const userId = session.user.id;

  // Real-time Database Queries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Start of current week (Monday)
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday
  const mondayOfThisWeek = new Date(startOfToday);
  mondayOfThisWeek.setDate(mondayOfThisWeek.getDate() - currentDayOfWeek);

  const [
    user,
    completedCount,
    enrollments,
    userRank,
    topUsers,
    recentLessonProgress,
    thisWeekProgress,
    todayRewardClaim,
    recentAchievements,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { xp: true, coins: true, currentStreak: true, name: true, level: true, image: true, username: true }
    }),
    db.lessonProgress.count({
      where: { userId, completed: true }
    }),
    db.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: { title: true, slug: true, icon: true, color: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 4
    }),
    db.user.count({
      where: { xp: { gt: (await db.user.findUnique({ where: { id: userId }, select: { xp: true } }))?.xp ?? 0 } }
    }).then(c => c + 1),
    db.user.findMany({
      orderBy: { xp: 'desc' },
      take: 5,
      select: { id: true, name: true, username: true, xp: true, image: true }
    }),
    db.lessonProgress.findFirst({
      where: { userId, completed: false },
      orderBy: { updatedAt: 'desc' },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            chapter: {
              select: {
                course: { select: { title: true, slug: true, color: true } }
              }
            }
          }
        }
      }
    }),
    db.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: mondayOfThisWeek }
      },
      select: { completedAt: true, xpEarned: true }
    }),
    db.userDailyReward.findFirst({
      where: {
        userId,
        claimedAt: { gte: startOfToday, lte: endOfToday }
      }
    }),
    db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
      take: 4
    })
  ]);

  const xp = user?.xp ?? 0;
  const coins = user?.coins ?? 0;
  const streak = user?.currentStreak ?? 0;
  const name = user?.name ?? session?.user?.name ?? 'Öğrenci';
  const levelData = getLevelFromXP(xp);

  const todayText = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(now);

  // Compute Real Weekly XP per day (Mon - Sun)
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const weeklyXpMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const record of thisWeekProgress) {
    if (record.completedAt) {
      const dayIndex = (record.completedAt.getDay() + 6) % 7;
      weeklyXpMap[dayIndex] = (weeklyXpMap[dayIndex] || 0) + (record.xpEarned || 25);
    }
  }

  const weeklyData = dayNames.map((name, index) => ({
    day: name,
    xp: weeklyXpMap[index] || 0
  }));

  const isRewardClaimedToday = !!todayRewardClaim;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hoş geldin, <span className="gradient-text">{name}</span>! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">{todayText}</p>
        </div>
        <div className="glass-card flex items-center gap-3 px-4 py-2.5 rounded-full border border-orange-500/30 bg-orange-500/10">
          <Flame className="w-5 h-5 text-orange-400 streak-fire" />
          <span className="font-bold text-orange-300">{streak} Günlük Seri</span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Card */}
        <div className="glass-card p-5 rounded-xl border border-white/10 bg-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Toplam XP</p>
              <h3 className="text-2xl font-bold">{formatXP ? formatXP(xp) : xp}</h3>
            </div>
            <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 border border-blue-500/30">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-400">Seviye {levelData.level}</span>
              <span className="text-slate-400">{levelData.currentXP} / {levelData.requiredXP} XP</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden xp-bar">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.max(5, levelData.progress)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Coins Card */}
        <div className="glass-card p-5 rounded-xl border border-white/10 bg-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Altın</p>
              <h3 className="text-2xl font-bold text-yellow-400">{coins} 🪙</h3>
              <p className="text-xs text-slate-400 mt-2">Kullanılabilir Altın</p>
            </div>
            <div className="bg-yellow-500/20 p-2.5 rounded-xl text-yellow-400 border border-yellow-500/30">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="glass-card p-5 rounded-xl border border-white/10 bg-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Seri</p>
              <h3 className="text-2xl font-bold text-orange-400">{streak} Gün</h3>
              <p className="text-xs text-slate-400 mt-2">Aktif Giriş Serisi</p>
            </div>
            <div className="bg-orange-500/20 p-2.5 rounded-xl text-orange-400 border border-orange-500/30">
              <Flame className="w-5 h-5 streak-fire" />
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="glass-card p-5 rounded-xl border border-white/10 bg-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Tamamlanan</p>
              <h3 className="text-2xl font-bold text-purple-400">{completedCount} Ders</h3>
              <p className="text-xs text-slate-400 mt-2">Bitirilen Modüller</p>
            </div>
            <div className="bg-purple-500/20 p-2.5 rounded-xl text-purple-400 border border-purple-500/30">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-white">Kaldığın Yerden Devam Et</h2>
            {recentLessonProgress ? (
              <div className="glass-card p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col sm:flex-row gap-6 items-center">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg text-2xl font-bold"
                  style={{ background: recentLessonProgress.lesson.chapter.course.color ?? '#3b82f6' }}
                >
                  <Play className="w-8 h-8 fill-current" />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                    {recentLessonProgress.lesson.chapter.course.title}
                  </div>
                  <h3 className="text-lg font-bold text-white">{recentLessonProgress.lesson.title}</h3>
                  <p className="text-xs text-slate-400">Öğrenmeye devam ederek XP ve altınlarını topla!</p>
                </div>
                <Link
                  href={`/kurslar/${recentLessonProgress.lesson.chapter.course.slug}/ders/${recentLessonProgress.lesson.id}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center hover:opacity-90 transition-all shrink-0 shadow-lg shadow-blue-500/20"
                >
                  Devam Et
                </Link>
              </div>
            ) : (
              <div className="glass-card p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col sm:flex-row gap-6 items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Yeni Bir Kursa Başla!</h3>
                  <p className="text-xs text-slate-400">Sana uygun bir kurs seç, kod yazmaya hemen başla.</p>
                </div>
                <Link href="/kurslar" className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center hover:opacity-90 transition-all shrink-0 shadow-lg">
                  Kursları Keşfet
                </Link>
              </div>
            )}
          </section>

          {/* Course Progress */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Kurslarım</h2>
              <Link href="/kurslar" className="text-sm text-blue-400 hover:text-blue-300 flex items-center font-medium">
                Tüm Kursları Gör <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrollments.length === 0 ? (
                <div className="col-span-2 glass-card p-8 rounded-xl border border-white/10 bg-white/5 text-center">
                  <p className="text-slate-400 text-sm mb-3">Henüz bir kursa kaydolmadın.</p>
                  <Link href="/kurslar" className="inline-block px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:opacity-90">
                    Kurslara Göz At
                  </Link>
                </div>
              ) : enrollments.map((enrollment) => (
                <div key={enrollment.id} className="glass-card p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{enrollment.course.icon ?? '📖'}</div>
                    <h3 className="font-bold text-white truncate flex-1">{enrollment.course.title}</h3>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${enrollment.progress ?? 0}%`, background: enrollment.course.color ?? '#3b82f6' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{enrollment.completed ? '✅ Tamamlandı' : 'İlerleme'}</span>
                      <span className="text-blue-400 font-semibold">%{enrollment.progress ?? 0}</span>
                    </div>
                  </div>
                  <Link href={`/kurslar/${enrollment.course.slug}`} className="block w-full py-2 rounded-lg font-medium bg-white/10 text-center hover:bg-white/20 transition-colors text-sm text-slate-200">
                    Devam Et
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly XP Chart */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-white">Haftalık XP İstatistiği (Canlı)</h2>
            <div className="glass-card p-6 rounded-xl border border-white/10 bg-white/5">
              <WeeklyChart data={weeklyData} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Daily Reward Banner */}
          <section>
            <div className={`p-6 rounded-2xl border text-center relative overflow-hidden transition-all shadow-xl ${
              isRewardClaimedToday 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-gradient-to-b from-blue-950/50 via-purple-950/30 to-slate-900 border-blue-500/40 shadow-blue-500/10'
            }`}>
              {isRewardClaimedToday ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-1 text-emerald-200">Bugünkü Ödülünü Aldın!</h3>
                  <p className="text-xs text-slate-400 mb-4">Harika serini bozma. Yarın tekrar gel!</p>
                  <Link href="/odullerim" className="inline-block w-full py-2.5 rounded-xl font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm">
                    Takvimi İncele
                  </Link>
                </>
              ) : (
                <>
                  <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="font-bold text-lg mb-1 text-white">Bugünkü Ödülün Hazır! 🎁</h3>
                  <p className="text-xs text-slate-300 mb-4">Giriş serini koru, +Altın ve +XP topla.</p>
                  <Link href="/odullerim" className="inline-block w-full py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-slate-950 hover:opacity-90 transition-opacity text-sm shadow-lg shadow-yellow-500/20">
                    Ödülünü Al →
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* Real Leaderboard Peek */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Liderlik Tablosu (Canlı)</h2>
              <Link href="/liderlik" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                Tümünü Gör
              </Link>
            </div>
            <div className="glass-card p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <div className="text-sm font-medium text-slate-400 mb-2">
                Sıralaman: <span className="text-blue-400 font-bold">#{userRank}</span>
              </div>
              {topUsers.map((u, i) => {
                const rank = i + 1;
                const isCurrent = u.id === userId;
                return (
                  <div key={u.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isCurrent ? 'bg-blue-500/20 border border-blue-500/40' : 'hover:bg-white/5'}`}>
                    <div className={`w-6 text-center font-bold text-sm ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-500' : 'text-slate-500'}`}>
                      #{rank}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300 overflow-hidden shrink-0">
                      {u.image ? <img src={u.image} alt={u.name || ''} className="w-full h-full object-cover" /> : u.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 truncate text-sm font-medium text-slate-200">
                      {u.name || u.username || 'Kullanıcı'}
                    </div>
                    <div className="text-xs font-bold text-blue-400 shrink-0">{u.xp} XP</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Achievements */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Son Kazanılan Başarımlar</h2>
              <Link href="/basarimlar" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                Tümü
              </Link>
            </div>
            <div className="glass-card p-5 rounded-xl border border-white/10 bg-white/5">
              {recentAchievements.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Henüz kazanılan başarım yok. Ders tamamlayarak rozetler kazan!</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {recentAchievements.map((ua) => (
                    <div key={ua.id} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
                      <div className="text-xl shrink-0">{ua.achievement.icon || '🏆'}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{ua.achievement.title}</p>
                        <p className="text-[10px] text-purple-300">+{ua.achievement.xpReward} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
