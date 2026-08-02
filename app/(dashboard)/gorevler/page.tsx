import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { GorevlerClient } from "./gorevler-client";
import { Target, Flame, Sparkles, Award, Zap, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Günlük Görevler & Quests | CodeTR",
  description: "Günlük görevleri tamamla, ekstra XP ve Altın kazan!",
};

export default async function QuestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [user, lessonsCompletedToday] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { xp: true, coins: true, level: true },
    }),
    db.lessonProgress.count({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold shadow-lg">
          <Target className="w-4 h-4 text-orange-400" /> Günlük Ödüllü Quest Sistemi
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Günlük <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Görevler</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Her gün yenilenen görevleri yap, serini koru ve ekstra **XP &amp; Altın** bonuslarını topla!
        </p>
      </div>

      <GorevlerClient user={user} lessonsCompletedToday={lessonsCompletedToday} />
    </div>
  );
}
