import { auth } from '@/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Lock, Play, Zap, KeyRound, ShieldAlert, Check } from 'lucide-react';
import { enrollCourse } from '@/lib/actions/courses';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await db.course.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!course) return { title: 'Kurs Bulunamadı' };
  return { title: `${course.title} | CodeTR`, description: course.description };
}

export default async function KursDetayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug } = await params;
  const { error, success } = (await searchParams) || {};
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');

  const isAdmin = (session.user as any).role === 'ADMIN';

  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      chapters: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            select: { id: true, title: true, type: true, xpReward: true, order: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const [enrollment, progressRecords] = await Promise.all([
    db.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    }),
    db.lessonProgress.findMany({
      where: { userId: session.user.id, lesson: { chapter: { courseId: course.id } }, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const completedIds   = new Set(progressRecords.map(p => p.lessonId));
  const totalLessons   = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedCount = completedIds.size;
  const progress       = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // First incomplete lesson
  let firstIncomplete: string | null = null;
  outer: for (const chapter of course.chapters) {
    for (const lesson of chapter.lessons) {
      if (!completedIds.has(lesson.id)) { firstIncomplete = lesson.id; break outer; }
    }
  }

  const lessonUrl = (id: string) => `/kurslar/${course.slug}/ders/${id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/kurslar" className="hover:text-slate-300 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Kurslar
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-300">{course.title}</span>
      </nav>

      {/* Hero */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
        <div className="h-2" style={{ background: course.color ?? '#3b82f6' }} />
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shrink-0 shadow-lg"
              style={{ background: `${course.color ?? '#3b82f6'}22`, border: `2px solid ${course.color ?? '#3b82f6'}44` }}
            >
              {course.icon ?? '📖'}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium uppercase">
                  {course.language}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                  {course.level === 'BEGINNER' ? 'Başlangıç' : course.level === 'INTERMEDIATE' ? 'Orta' : 'İleri'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-slate-400 text-sm leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalLessons}</p>
              <p className="text-xs text-slate-400 mt-0.5">Ders</p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-2xl font-bold text-white">{course.chapters.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Bölüm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{course.xpReward}</p>
              <p className="text-xs text-slate-400 mt-0.5">XP Ödül</p>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
              <Check className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Key Form / Enrollment CTA */}
          {enrollment ? (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{completedCount} / {totalLessons} ders tamamlandı</span>
                <span className="text-blue-400 font-semibold">%{progress}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: course.color ?? '#3b82f6' }} />
              </div>
              {firstIncomplete ? (
                <Link
                  href={lessonUrl(firstIncomplete)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${course.color ?? '#3b82f6'}, #8b5cf6)` }}
                >
                  <Play className="w-5 h-5 fill-current" /> Devam Et
                </Link>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                  <CheckCircle2 className="w-5 h-5" /> Kurs Tamamlandı! 🎉
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <form action={enrollCourse} className="space-y-3">
                <input type="hidden" name="courseId" value={course.id} />
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="accessKey"
                      placeholder="Erişim Anahtarı (Örn: CODETR-VIPKEY-9999)"
                      required={!isAdmin}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono tracking-wider"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-all shrink-0 shadow-lg shadow-blue-500/20 active:scale-[0.99]"
                    style={{ background: `linear-gradient(135deg, ${course.color ?? '#3b82f6'}, #8b5cf6)` }}
                  >
                    <KeyRound className="w-4 h-4" /> Anahtar İle Kursu Aç
                  </button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 px-1 gap-2 border-t border-white/5 pt-3">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <KeyRound className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  Bu kursa erişmek için bir <strong>Erişim Anahtarı (Key)</strong> girmelisiniz.
                </span>
                {isAdmin ? (
                  <span className="text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                    ⚡ Admin (Anahtarsız Açılabilir)
                  </span>
                ) : (
                  <Link href="/admin/keys" className="text-blue-400 hover:underline">
                    Anahtarınız yok mu?
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chapters & Lessons */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Müfredat</h2>
        {course.chapters.map((chapter, chIdx) => {
          const chCompleted = chapter.lessons.filter(l => completedIds.has(l.id)).length;
          return (
            <div key={chapter.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: course.color ?? '#3b82f6' }}>
                    {chIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{chapter.title}</h3>
                    {chapter.description && <p className="text-xs text-slate-500 mt-0.5">{chapter.description}</p>}
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{chCompleted}/{chapter.lessons.length} tamamlandı</span>
              </div>

              <div className="divide-y divide-white/5">
                {chapter.lessons.map((lesson, lIdx) => {
                  const isDone   = completedIds.has(lesson.id);
                  return (
                    <div key={lesson.id}>
                      {enrollment ? (
                        <Link href={lessonUrl(lesson.id)} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors group">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'}`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-xs text-slate-400">{lIdx + 1}</span>}
                          </div>
                          <span className={`text-sm flex-1 ${isDone ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-white'}`}>{lesson.title}</span>
                          <span className="text-xs text-yellow-500 flex items-center gap-1 shrink-0"><Zap className="w-3 h-3" />{lesson.xpReward} XP</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-4 px-5 py-3.5 opacity-60">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="text-sm text-slate-500 flex-1">{lesson.title}</span>
                          <span className="text-xs text-yellow-600 flex items-center gap-1 shrink-0"><Zap className="w-3.5 h-3.5" />{lesson.xpReward} XP</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
