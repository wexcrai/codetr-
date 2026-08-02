"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function claimDuelVictory(xpAmount: number = 100, coinAmount: number = 50) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;

  try {
    const updatedUser = await db.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpAmount },
          coins: { increment: coinAmount },
          totalXpEarned: { increment: xpAmount },
          totalCoinsEarned: { increment: coinAmount },
        },
        select: { xp: true, coins: true },
      });

      await tx.notification.create({
        data: {
          userId,
          title: "1v1 Düello Zaferi! ⚔️🎉",
          message: `Rakibini mağlup ettin! +${xpAmount} XP ve +${coinAmount} Altın hesabına eklendi.`,
          type: "COINS_EARNED",
        },
      });

      return u;
    });

    revalidatePath("/duello");
    revalidatePath("/panel");
    revalidatePath("/profil");
    revalidatePath("/liderlik");

    return {
      success: true,
      message: `Tebrikler! +${xpAmount} XP ve +${coinAmount} Altın hesabına eklendi!`,
      newXp: updatedUser.xp,
      newCoins: updatedUser.coins,
    };
  } catch (err) {
    console.error("claimDuelVictory error:", err);
    return { success: false, error: "Ödül işlenirken bir hata oluştu." };
  }
}
