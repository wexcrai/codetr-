import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart2, Zap, Brain, Code2, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Yazılımcı Analitiği & Yetenek Grafiği | CodeTR",
  description: "Yazılım yetenek haritanı ve kişisel gelişim analizini incele.",
};

export default async function AnalysisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [user, enrollments, completedLessonsCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, xp: true, level: true, currentStreak: true },
    }),
    db.courseEnrollment.findMany({
      where: { userId },
      include: { course: { select: { title: true, language: true } } },
    }),
    db.lessonProgress.count({
      where: { userId, completed: true },
    }),
  ]);

  const SKILL_SCORES = [
    { name: "Python Programlama", lang: "Python", icon: "🐍", score: Math.min(100, Math.max(35, (user?.xp ?? 0) / 10 + 30)), color: "from-blue-500 to-emerald-500" },
    { name: "Modern JavaScript / TS", lang: "JS/TS", icon: "⚡", score: Math.min(100, Math.max(40, (user?.xp ?? 0) / 12 + 25)), color: "from-yellow-400 to-amber-500" },
    { name: "Algoritma & Problem Çözme", lang: "Algoritma", icon: "🧠", score: Math.min(100, Math.max(50, completedLessonsCount * 15 + 20)), color: "from-purple-500 to-pink-500" },
    { name: "Web Tasarım & Layout", lang: "HTML/CSS", icon: "🎨", score: Math.min(100, Math.max(45, (user?.xp ?? 0) / 15 + 30)), color: "from-orange-500 to-red-500" },
    { name: "Veritabanı & SQL", lang: "SQL", icon: "🗄️", score: Math.min(100, Math.max(20, (user?.xp ?? 0) / 20 + 15)), color: "from-cyan-400 to-blue-600" },
    { name: "Sistem & OOP (Java/C++)", lang: "OOP", icon: "☕", score: Math.min(100, Math.max(30, (user?.xp ?? 0) / 18 + 20)), color: "from-amber-400 to-yellow-300" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold shadow-lg">
          <BarChart2 className="w-4 h-4 text-cyan-400" /> Yapay Zeka Destekli Yetenek Analizi
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Yazılımcı <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Yetenek Haritası</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Çözdüğünüz dersler ve XP puanlarınıza göre hesaplanan kişisel yetenek raporunuz.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SKILL_SCORES.map((skill) => (
          <div key={skill.name} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-base">{skill.name}</h3>
                  <span className="text-[10px] text-slate-400">Yetenek Seviyesi</span>
                </div>
              </div>

              <span className="text-lg font-extrabold text-cyan-400">%{Math.round(skill.score)}</span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000`}
                style={{ width: `${skill.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation Box */}
      <div className="p-8 rounded-3xl border border-blue-500/30 bg-blue-950/20 backdrop-blur-md space-y-3 shadow-2xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> AI Gelişim Tavsiyesi
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Harika bir gelişim gösteriyorsunuz! <strong>Algoritma &amp; Problem Çözme</strong> yeteneğiniz oldukça güçlü seviyede.
          Puanınızı daha da artırmak için <strong>SQL Veritabanı</strong> ve <strong>Alıştırmalar</strong> bölümlerinde daha fazla pratik yapmanızı tavsiye ederiz.
        </p>
      </div>
    </div>
  );
}
