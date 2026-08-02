import { db } from "@/lib/db";
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    include: {
      chapters: {
        include: { lessons: true }
      }
    },
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kurs Yönetimi</h1>
          <p className="text-slate-400 mt-1">Tüm kursları oluşturun, düzenleyin ve yönetin.</p>
        </div>
        <Link 
          href="/admin/kurslar/yeni"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Yeni Kurs Ekle
        </Link>
      </div>

      <div className="grid gap-4">
        {courses.map((course) => {
          const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
          return (
            <div key={course.id} className="glass-card flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{ backgroundColor: (course.color ?? undefined) + '20', border: `1px solid ${course.color ?? undefined}40` }}
              >
                {course.icon}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  {course.title}
                  {!course.isPublished && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Taslak</span>
                  )}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{course.shortDesc}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor: course.color ?? undefined}}></span> {course.language}</span>
                  <span>•</span>
                  <span>{course.chapters.length} Bölüm</span>
                  <span>•</span>
                  <span>{totalLessons} Ders</span>
                  <span>•</span>
                  <span>{course.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Yayını Değiştir">
                  {course.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <Link href={`/admin/kurslar/${course.id}`} className="p-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors" title="Düzenle">
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Sil">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl border border-slate-800 bg-slate-900/50">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Henüz kurs yok</h3>
            <p className="text-slate-400 mb-6">İlk kursunuzu oluşturarak platformu canlandırın.</p>
            <Link 
              href="/admin/kurslar/yeni"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              İlk Kursu Oluştur
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
