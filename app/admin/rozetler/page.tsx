import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AVAILABLE_BADGES } from "@/lib/badge-data";
import { AdminRozetClient } from "./admin-rozet-client";
import { Award, ShieldCheck, User } from "lucide-react";

export const metadata = {
  title: "Admin Rozet Verme Paneli | CodeTR Admin",
};

export default async function AdminBadgesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin) redirect("/panel");

  const [users, userBadges] = await Promise.all([
    db.user.findMany({
      orderBy: { xp: "desc" },
      select: { id: true, name: true, username: true, userTag: true, email: true, image: true, equippedBadge: true },
    }),
    db.userBadge.findMany({
      select: { id: true, userId: true, badgeId: true, badgeTitle: true, grantedAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" /> Admin Rozet Yönetim Paneli
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kullanıcılara özel başarı rozetleri ve unvanlar verin veya mevcut rozetleri yönetin.
          </p>
        </div>
      </div>

      <AdminRozetClient
        users={users}
        badges={AVAILABLE_BADGES}
        userBadges={userBadges}
      />
    </div>
  );
}
