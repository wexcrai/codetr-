"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SHOP_ITEMS } from "@/lib/shop-data";

export async function buyShopItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;

  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    return { success: false, error: "Geçersiz market ürünü." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { coins: true, theme: true },
  });

  if (!user) {
    return { success: false, error: "Kullanıcı bulunamadı." };
  }

  if (user.coins < item.price) {
    return { success: false, error: `Yetersiz altın! Bu ürün için ${item.price} Altın gerekiyor. Mevcut Altınınız: ${user.coins} 🪙` };
  }

  // Handle purchase based on item
  try {
    await db.$transaction(async (tx) => {
      // Deduct coins
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: item.price },
        },
      });

      // Special item logic
      if (item.id === "random-key") {
        // Find an active access key or create one
        const sampleKey = `CODETR-SHOP-${Math.floor(1000 + Math.random() * 9000)}`;
        await tx.accessKey.create({
          data: {
            key: sampleKey,
            type: "FULL_ACCESS",
            description: "Market'ten Satın Alınan Tam Erişim Anahtarı",
            maxUses: 1,
            createdById: userId,
            status: "ACTIVE",
          },
        });

        await tx.notification.create({
          data: {
            userId,
            title: "Sürpriz Anahtar Satın Alındı! 🔑",
            message: `Market'ten anahtarınız oluşturuldu: ${sampleKey}. Bu anahtarla dilediğiniz kursu açabilirsiniz!`,
            type: "COINS_EARNED",
          },
        });
      } else {
        await tx.notification.create({
          data: {
            userId,
            title: `${item.name} Satın Alındı! 🛒`,
            message: `${item.price} Altın karşılığında ${item.name} hesabınıza tanımlandı.`,
            type: "COINS_EARNED",
          },
        });
      }
    });
  } catch (err) {
    console.error("buyShopItem error:", err);
    return { success: false, error: "Satın alma sırasında bir hata oluştu." };
  }

  revalidatePath("/market");
  revalidatePath("/panel");
  revalidatePath("/profil");

  return {
    success: true,
    message: `${item.name} başarıyla satın alındı! 🎉`,
    remainingCoins: user.coins - item.price,
  };
}
