"use server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CODETR-${segment()}-${segment()}-${segment()}`;
}

export async function createAccessKey(data: {
  type: string;
  description: string;
  maxUses: number;
  courseId?: string;
  xpAmount?: number;
  coinAmount?: number;
  expiresAt?: Date | null;
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Yetkisiz işlem.');
  }

  const keyString = generateKey();

  const accessKey = await db.accessKey.create({
    data: {
      key: keyString,
      type: data.type as any,
      description: data.description,
      maxUses: data.maxUses,
      courseId: data.courseId ?? null,
      xpAmount: data.xpAmount ?? 0,
      coinAmount: data.coinAmount ?? 0,
      expiresAt: data.expiresAt ?? null,
      createdById: session.user.id!,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/admin/keys');
  return accessKey;
}

export async function revokeAccessKey(keyId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Yetkisiz işlem.');
  }

  await db.accessKey.update({
    where: { id: keyId },
    data: { status: 'REVOKED' },
  });

  revalidatePath('/admin/keys');
}

export async function redeemKey(keyInput: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Giriş yapmanız gerekiyor.' };
  }

  const userId = session.user.id!;

  // Find the key
  const key = await db.accessKey.findUnique({
    where: { key: keyInput.toUpperCase().trim() },
  });

  if (!key) {
    return { success: false, error: 'Geçersiz anahtar.' };
  }

  if (key.status !== 'ACTIVE') {
    return { success: false, error: 'Bu anahtar artık aktif değil.' };
  }

  if (key.usedCount >= key.maxUses) {
    return { success: false, error: 'Bu anahtar maksimum kullanım sayısına ulaştı.' };
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    return { success: false, error: 'Bu anahtarın süresi dolmuş.' };
  }

  // Check if user already redeemed
  const existingRedemption = await db.keyRedemption.findUnique({
    where: {
      keyId_userId: { keyId: key.id, userId },
    },
  });

  if (existingRedemption) {
    return { success: false, error: 'Bu anahtarı zaten kullandınız.' };
  }

  // Apply reward in transaction
  try {
    await db.$transaction(async (tx) => {
      // Create redemption record
      await tx.keyRedemption.create({
        data: { keyId: key.id, userId },
      });

      // Update key usage
      const newUsedCount = key.usedCount + 1;
      await tx.accessKey.update({
        where: { id: key.id },
        data: {
          usedCount: newUsedCount,
          status: newUsedCount >= key.maxUses ? 'USED' : 'ACTIVE',
        },
      });

      // Apply reward based on type
      if (key.type === 'COURSE_ACCESS' && key.courseId) {
        await tx.courseEnrollment.upsert({
          where: { userId_courseId: { userId, courseId: key.courseId } },
          update: {},
          create: { userId, courseId: key.courseId },
        });
      } else if (key.type === 'XP_BOOST' && key.xpAmount > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: key.xpAmount },
            totalXpEarned: { increment: key.xpAmount },
          },
        });
      } else if (key.type === 'COIN_PACK' && key.coinAmount > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { coins: { increment: key.coinAmount } },
        });
      } else if (['PREMIUM_MONTH', 'PREMIUM_YEAR', 'FULL_ACCESS'].includes(key.type)) {
        await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: 500 },
            totalXpEarned: { increment: 500 },
          },
        });
      }

      // Notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Anahtar Kullanıldı 🎉',
          message: 'Erişim anahtarınız başarıyla kullanıldı ve ödülleriniz hesabınıza eklendi.',
          type: 'SYSTEM',
        },
      });
    });
  } catch (err) {
    console.error('redeemKey transaction error:', err);
    return { success: false, error: 'İşlem sırasında hata oluştu. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/panel');
  revalidatePath('/ayarlar');
  return { success: true, message: 'Anahtar başarıyla kullanıldı! Ödülünüz hesabınıza eklendi.', type: key.type };
}

export async function getAdminKeys() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Yetkisiz işlem.');
  }

  const keys = await db.accessKey.findMany({
    include: {
      createdBy: { select: { name: true, email: true } },
      courseId_rel: { select: { title: true } },
      redemptions: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Normalize for client
  return keys.map((k) => ({
    ...k,
    courseTitle: k.courseId_rel?.title ?? null,
    redemptionCount: k.redemptions.length,
  }));
}

export async function getKeyStats() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Yetkisiz işlem.');
  }

  const [total, active, used, revoked, totalRedemptions] = await Promise.all([
    db.accessKey.count(),
    db.accessKey.count({ where: { status: 'ACTIVE' } }),
    db.accessKey.count({ where: { status: 'USED' } }),
    db.accessKey.count({ where: { status: 'REVOKED' } }),
    db.keyRedemption.count(),
  ]);

  return { total, active, used, revoked, totalRedemptions };
}
