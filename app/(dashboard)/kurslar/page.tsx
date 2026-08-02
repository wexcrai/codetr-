import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChevronRight, Zap } from 'lucide-react';

const levelLabels: Record<string, { label: string; color: string }> = {
  BEGINNER:     { label: 'Başlangıç', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  INTERMEDIATE: { label: 'Orta',      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  ADVANCED:     { label: 'İleri',     color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  EXPERT:       { label: 'Uzman',     color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

export const metadata = {
  title: 'Kurslar | CodeTR',
  description: 'Tüm programlama kurslarını keşfet ve öğrenmeye başla.',
};

export default async function KurslarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');

  const [courses, enrollments] = await Promise.all([
    db.course.findMany({
      where: { isPublished: true },
      include: {
        chapters: { select: { _count: { select: { lessons: true } } } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'asc' }],
    }),
    db.courseEnrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true, progress: true, completed: true },
    }),
  ]);

  const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e]));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Kurslar</h1>
        <p className="text-slate-400 mt-1">{courses.length} kurs mevcut — sana uygun olanı seç ve öğrenmeye başla!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Kurs',  value: courses.length,                                                 icon: '📚' },
          { label: 'Kayıtlı',      value: enrollments.length,                                             icon: '✅' },
          { label: 'Tamamlanan',   value: enrollments.filter(e => e.completed).length,                    icon: '🏆' },
          { label: 'Aktif',        value: enrollments.filter(e => !e.completed && e.progress > 0).length, icon: '⚡' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl p-4 border border-white/10 bg-white/5 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const enrollment   = enrollmentMap.get(course.id);
          const isEnrolled   = !!enrollment;
          const progress     = enrollment?.progress ?? 0;
          const isCompleted  = enrollment?.completed ?? false;
          const totalLessons = course.chapters.reduce((acc, ch) => acc + ch._count.lessons, 0);
          const lvl          = levelLabels[course.level] ?? levelLabels.BEGINNER;

          return (
            <Link
              key={course.id}
              href={`/kurslar/${course.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="h-2 w-full" style={{ background: course.color ?? '#3b82f6' }} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                    style={{ background: `${course.color ?? '#3b82f6'}22`, border: `1.5px solid ${course.color ?? '#3b82f6'}44` }}
                  >
                    {course.icon ?? '📖'}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {course.isFeatured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 uppercase tracking-wide">
                        ⭐ Öne Çıkan
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${lvl.color} uppercase tracking-wide`}>
                      {lvl.label}
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{course.title}</h2>
                <p className="text-sm text-slate-400 line-clamp-2 flex-1 mb-4">{course.description}</p>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{totalLessons} ders</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" />{course.xpReward} XP</span>
                </div>

                {isEnrolled ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{isCompleted ? '✅ Tamamlandı' : `%${progress} tamamlandı`}</span>
                      <span className="text-blue-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: isCompleted ? '#10b981' : (course.color ?? '#3b82f6') }} />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500">{isCompleted ? 'Tekrar Gözden Geçir' : 'Devam Et'}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-sm font-semibold text-blue-400">Kursa Başla</span>
                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Henüz yayınlanmış kurs bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}
