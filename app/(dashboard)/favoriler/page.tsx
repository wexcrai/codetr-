import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Bookmark, BookOpen, Star, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Favori Dersler & Yer İmleri | CodeTR",
  description: "Kaydettiğin ve tekrar etmek istediğin favori derslerin.",
};

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const BOOKMARKED_LESSONS = [
    {
      id: "python-temelleri",
      title: "Python Temelleri & Değişkenler",
      course: "Python 3 Sıfırdan İleri Seviye",
      language: "Python",
      icon: "🐍",
      url: "/kurslar/python/ders/python-temelleri",
    },
    {
      id: "js-async-await",
      title: "Modern JavaScript Async / Await",
      course: "Modern JavaScript & TypeScript",
      language: "JavaScript",
      icon: "⚡",
      url: "/kurslar/javascript/ders/js-async-await",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-lg">
          <Bookmark className="w-4 h-4 text-amber-400" /> Kaydedilen Dersler
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Favori <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">Derslerin</span>
        </h1>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          Tekrar etmek ve üzerinde pratik yapmak için kaydettiğiniz favori dersler listeniz.
        </p>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BOOKMARKED_LESSONS.map((item) => (
          <div key={item.id} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <Bookmark className="w-4 h-4 text-amber-400 fill-current" />
              </div>
              <span className="text-[10px] font-bold text-purple-400 uppercase font-mono">{item.course}</span>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
            </div>

            <a
              href={item.url}
              className="w-full py-2.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-slate-200 text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Derse Git</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
