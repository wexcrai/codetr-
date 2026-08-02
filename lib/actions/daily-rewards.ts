"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getDailyRewardStatus() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [user, allRewards] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
        coins: true,
        xp: true,
        dailyRewards: {
          orderBy: { claimedAt: "desc" },
          take: 60,
        },
      },
    }),
    db.dailyReward.findMany({
      orderBy: { day: "asc" },
    }),
  ]);

  if (!user) return null;

  // Check if claimed today
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const claimedToday = user.dailyRewards.some(
    (r) => r.claimedAt >= startOfToday && r.claimedAt <= endOfToday
  );

  // Check if streak is broken (last streak date was before yesterday)
  const yesterdayStart = new Date(startOfToday);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  let activeStreak = user.currentStreak;
  if (user.lastStreakDate && user.lastStreakDate < yesterdayStart) {
    // Streak broken if not claimed yesterday or today
    activeStreak = 0;
  }

  // Calculate current claim day (1-30)
  const currentDay = Math.min(((activeStreak) % 30) + 1, 30);

  const claimedDaysSet = new Set(
    user.dailyRewards.map((r) => r.day)
  );

  return {
    streak: activeStreak,
    longestStreak: user.longestStreak,
    claimedToday,
    currentDayNumber: currentDay,
    claimedDays: Array.from(claimedDaysSet),
    allRewards,
  };
}

export async function claimDailyReward() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastStreakDate: true,
      xp: true,
      coins: true,
      totalXpEarned: true,
      totalCoinsEarned: true,
      dailyRewards: {
        orderBy: { claimedAt: "desc" },
        take: 30,
      },
    },
  });

  if (!user) {
    return { success: false, error: "Kullanıcı bulunamadı." };
  }

  // Check today's claim
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const alreadyClaimed = user.dailyRewards.some(
    (r) => r.claimedAt >= startOfToday && r.claimedAt <= endOfToday
  );

  if (alreadyClaimed) {
    return { success: false, error: "Bugünkü ödülünüzü zaten aldınız!" };
  }

  // Check streak continuity
  const yesterdayStart = new Date(startOfToday);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  let newStreak = user.currentStreak;
  if (!user.lastStreakDate || user.lastStreakDate < yesterdayStart) {
    // Reset streak if missed more than 1 day
    newStreak = 1;
  } else if (user.lastStreakDate >= yesterdayStart && user.lastStreakDate < startOfToday) {
    // Consecutive day!
    newStreak = user.currentStreak + 1;
  } else {
    // Same day claim
    newStreak = Math.max(user.currentStreak, 1);
  }

  const newLongestStreak = Math.max(user.longestStreak, newStreak);
  const dayInCycle = ((newStreak - 1) % 30) + 1;

  // Get reward config for dayInCycle
  const rewardConfig = await db.dailyReward.findUnique({
    where: { day: dayInCycle },
  });

  const coinReward = rewardConfig?.coinReward ?? (10 + Math.floor(dayInCycle / 5) * 5);
  const xpReward = rewardConfig?.xpReward ?? (20 + Math.floor(dayInCycle / 3) * 10);

  const newTotalXp = user.totalXpEarned + xpReward;
  let newLevel = Math.floor(Math.sqrt(newTotalXp / 100)) + 1;
  if (newLevel > 100) newLevel = 100;

  try {
    await db.$transaction(async (tx) => {
      // Create reward claim record
      await tx.userDailyReward.create({
        data: {
          userId,
          day: dayInCycle,
          claimedAt: now,
        },
      });

      // Update user stats
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: coinReward },
          xp: { increment: xpReward },
          totalCoinsEarned: { increment: coinReward },
          totalXpEarned: { increment: xpReward },
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastStreakDate: now,
          level: newLevel,
        },
      });

      // Send notification
      await tx.notification.create({
        data: {
          userId,
          title: "Günlük Ödül Alındı! 🎁",
          message: `Gün ${dayInCycle} ödülün hesabına eklendi: +${coinReward} Altın, +${xpReward} XP!`,
          type: "DAILY_REWARD",
        },
      });
    });
  } catch (err) {
    console.error("claimDailyReward error:", err);
    return { success: false, error: "Ödül alınırken bir hata oluştu." };
  }

  revalidatePath("/odullerim");
  revalidatePath("/panel");
  revalidatePath("/profil");

  return {
    success: true,
    message: `Gün ${dayInCycle} ödülü alındı!`,
    coinReward,
    xpReward,
    streak: newStreak,
    day: dayInCycle,
  };
}
