import { db } from "@/lib/db";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminLessonsPage() {
  const lessons = await db.lesson.findMany({
    include: {
      chapter: {
        include: {
          course: true
        }
      }
    },
    orderBy: [
      { chapter: { courseId: 'asc' } },
      { chapter: { order: 'asc' } },
      { order: 'asc' }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Ders Yönetimi</h1>
          <p className="text-slate-400 mt-1">İçerik adımlarını, sınavları ve görevleri yönetin.</p>
        </div>
        <Link 
          href="/admin/dersler/yeni"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Yeni Ders Oluştur
        </Link>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ders ara..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Sıra</th>
                <th className="px-6 py-4">Başlık</th>
                <th className="px-6 py-4">Kurs / Bölüm</th>
                <th className="px-6 py-4">Tür</th>
                <th className="px-6 py-4">Ödül</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono">
                    {lesson.chapter.course.order}.{lesson.chapter.order}.{lesson.order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{lesson.title}</div>
                    {!lesson.isPublished && (
                      <span className="text-[10px] uppercase text-amber-400">Taslak</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-slate-300">{lesson.chapter.course.title}</span>
                      <span className="text-xs text-slate-500">{lesson.chapter.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium border",
                      lesson.type === 'LESSON' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      lesson.type === 'QUIZ' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      lesson.type === 'CHALLENGE' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-green-500/10 text-green-400 border-green-500/20"
                    )}>
                      {lesson.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-yellow-500 font-medium">
                        {lesson.xpReward} XP
                      </span>
                      {lesson.coinReward > 0 && (
                        <span className="flex items-center gap-1 text-amber-300 font-medium">
                          {lesson.coinReward} 🪙
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/dersler/${lesson.id}`} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lessons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Henüz hiç ders oluşturulmamış.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
