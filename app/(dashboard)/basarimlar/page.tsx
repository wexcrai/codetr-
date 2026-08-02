import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserBadgeData } from "@/lib/actions/badges";
import { BadgeEquipClient } from "./badge-equip-client";
import { Medal, Trophy, Star, ShieldCheck, Award } from "lucide-react";

export const metadata = {
  title: "Başarımlar & Rozetler | CodeTR",
  description: "Kazandığın rozetleri kuşan, unvanını profilinde sergile.",
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [badgeData, userAchievements] = await Promise.all([
    getUserBadgeData(),
    db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-lg">
          <Medal className="w-4 h-4 text-amber-400" /> Rozet &amp; Unvan Vitrini
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Başarımlar &amp; <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">Rozetler</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Ders tamamladıkça rozetleri aç, profilinde göstermek istediğin unvanı seç ve kuşanın!
        </p>
      </div>

      {/* Badge Equip Showcase */}
      {badgeData && (
        <BadgeEquipClient
          equippedBadge={badgeData.equippedBadge}
          badges={badgeData.badges}
        />
      )}
    </div>
  );
}
