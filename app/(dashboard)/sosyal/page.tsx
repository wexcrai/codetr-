import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserFriendshipData } from "@/lib/actions/friendship";
import { FriendshipManager } from "./friendship-manager";
import { Users, UserPlus, Activity, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Sosyal & Arkadaşlık | CodeTR",
  description: "Diğer yazılımcıları arkadaş ekle, özel CodeTR kimliğini paylaş ve topluluğa katıl.",
};

export default async function SocialPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [friendshipData, allUsers, recentActivities] = await Promise.all([
    getUserFriendshipData(),
    db.user.findMany({
      where: { id: { not: userId } },
      orderBy: { xp: "desc" },
      take: 10,
      select: { id: true, name: true, username: true, userTag: true, image: true, xp: true, level: true, currentStreak: true },
    }),
    db.lessonProgress.findMany({
      where: { completed: true },
      orderBy: { completedAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true, username: true, userTag: true, image: true } },
        lesson: { select: { title: true, xpReward: true } },
      },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold shadow-lg">
          <Users className="w-4 h-4 text-purple-400" /> CodeTR Özel Kimlik &amp; Arkadaşlık Ağı
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Yazılımcı <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Sosyal Ağı</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Sana özel <strong>CodeTR Kimliğini (Tag/ID)</strong> arkadaşlarınla paylaş, birbirinizi ekleyin ve beraber kodlayın!
        </p>
      </div>

      {/* Friendship & Tag Management */}
      {friendshipData && (
        <FriendshipManager
          userTag={friendshipData.userTag || ''}
          friends={friendshipData.friends}
          pendingRequests={friendshipData.pendingRequests}
        />
      )}

      {/* Directory & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Coders Directory */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" /> Topululuktaki Yazılımcılar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allUsers.map((coder) => (
              <div key={coder.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between gap-3 backdrop-blur-md shadow-xl hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-white shrink-0">
                    {coder.image ? <img src={coder.image} alt="" className="w-full h-full object-cover" /> : coder.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{coder.name || coder.username}</p>
                    <p className="text-[11px] font-mono text-purple-400 font-bold">{coder.userTag || `@${coder.username}`}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="text-blue-400 font-semibold">Seviye {coder.level}</span>
                      <span>•</span>
                      <span className="text-yellow-400 font-semibold">{coder.xp} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> Canlı Aktivite Akışı
          </h2>

          <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Henüz aktivite bulunmuyor.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{act.user.name || act.user.username}</span>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">{act.user.userTag}</span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
                    <strong>{act.lesson.title}</strong> dersini bitirdi!
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                    <span className="text-yellow-400 font-bold">+{act.xpEarned || act.lesson.xpReward} XP</span>
                    <span>{act.completedAt ? new Date(act.completedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
