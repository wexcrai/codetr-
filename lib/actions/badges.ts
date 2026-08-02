"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AVAILABLE_BADGES } from "@/lib/badge-data";

export async function getUserBadgeData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [user, ownedBadges] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { equippedBadge: true, xp: true, level: true, role: true },
    }),
    db.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, badgeTitle: true, grantedAt: true },
    }),
  ]);

  const isAdmin = user?.role === "ADMIN";
  const ownedTitles = new Set(ownedBadges.map((b) => b.badgeTitle));

  return {
    equippedBadge: user?.equippedBadge || null,
    badges: AVAILABLE_BADGES.map((b) => ({
      ...b,
      isOwned: isAdmin || ownedTitles.has(b.title),
    })),
  };
}

export async function equipBadge(badgeTitle: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;

  if (badgeTitle) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
      const owned = await db.userBadge.findFirst({
        where: { userId, badgeTitle },
      });

      if (!owned) {
        return {
          success: false,
          error: "Bu rozete sahip değilsiniz! Rozetler sadece Admin yetkilileri tarafından verilebilir.",
        };
      }
    }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { equippedBadge: badgeTitle },
    });

    revalidatePath("/profil");
    revalidatePath("/basarimlar");
    revalidatePath("/panel");

    return {
      success: true,
      message: badgeTitle ? `'${badgeTitle}' rozeti kuşanıldı! 🎉` : "Rozet çıkarıldı.",
    };
  } catch (err) {
    console.error("equipBadge error:", err);
    return { success: false, error: "Rozet kuşanılırken hata oluştu." };
  }
}

export async function grantBadgeAdmin(data: { targetUserId: string; badgeId: string; badgeTitle: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Yetkisiz erişim." };
  }

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin) {
    return { success: false, error: "Bu işlem için admin yetkisi gerekiyor." };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.userBadge.upsert({
        where: { userId_badgeId: { userId: data.targetUserId, badgeId: data.badgeId } },
        update: { badgeTitle: data.badgeTitle, grantedBy: session.user.id },
        create: {
          userId: data.targetUserId,
          badgeId: data.badgeId,
          badgeTitle: data.badgeTitle,
          grantedBy: session.user.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: data.targetUserId,
          title: "Tebrikler! Yeni Rozet Verildi! 👑",
          message: `Admin tarafından hesabınıza '${data.badgeTitle}' rozeti eklendi. Başarımlar sayfasından kuşanabilirsiniz!`,
          type: "ACHIEVEMENT_UNLOCKED",
        },
      });
    });

    revalidatePath("/basarimlar");
    revalidatePath("/admin/rozetler");
    return { success: true, message: `'${data.badgeTitle}' rozeti başarıyla kullanıcıya verildi!` };
  } catch (err) {
    console.error("grantBadgeAdmin error:", err);
    return { success: false, error: "Rozet verilirken hata oluştu." };
  }
}

export async function revokeBadgeAdmin(data: { targetUserId: string; badgeId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Yetkisiz erişim." };
  }

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin) {
    return { success: false, error: "Bu işlem için admin yetkisi gerekiyor." };
  }

  try {
    await db.userBadge.delete({
      where: { userId_badgeId: { userId: data.targetUserId, badgeId: data.badgeId } },
    });

    revalidatePath("/basarimlar");
    revalidatePath("/admin/rozetler");
    return { success: true, message: "Rozet başarıyla geri alındı." };
  } catch (err) {
    console.error("revokeBadgeAdmin error:", err);
    return { success: false, error: "Rozet silinirken hata oluştu." };
  }
}
