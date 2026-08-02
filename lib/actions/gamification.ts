"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getLevelFromXP } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// ─── Award XP ────────────────────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  amount: number,
  reason: string
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, totalXpEarned: true },
  });

  if (!user) throw new Error("User not found");

  const oldLevel = user.level;
  const newTotalXP = user.xp + amount;
  const { level: newLevel } = getLevelFromXP(newTotalXP);
  const leveledUp = newLevel > oldLevel;

  await db.user.update({
    where: { id: userId },
    data: {
      xp: newTotalXP,
      level: newLevel,
      totalXpEarned: user.totalXpEarned + amount,
    },
  });

  // Log activity
  await db.userActivity.create({
    data: { userId, action: "xp_earned", data: { reason, amount }, xpEarned: amount },
  });

  // Award level-up notification
  if (leveledUp) {
    await db.notification.create({
      data: {
        userId,
        type: "XP_EARNED",
        title: `Seviye Atladınız! 🎉`,
        message: `Tebrikler! Seviye ${newLevel}'e ulaştınız.`,
        data: { level: newLevel },
      },
    });
  }

  await checkAchievements(userId);
  revalidatePath("/panel");

  return { newXP: newTotalXP, newLevel, leveledUp };
}

// ─── Award Coins ──────────────────────────────────────────────────────────────

export async function awardCoins(userId: string, amount: number): Promise<number> {
  const user = await db.user.update({
    where: { id: userId },
    data: {
      coins: { increment: amount },
      totalCoinsEarned: { increment: amount },
    },
    select: { coins: true },
  });
  return user.coins;
}

// ─── Complete Lesson ──────────────────────────────────────────────────────────

export async function completeLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor" };

  const userId = session.user.id;

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } },
    });

    if (!lesson) return { error: "Ders bulunamadı" };

    // Check if already completed
    const existing = await db.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existing?.completed) {
      return { success: true, alreadyCompleted: true };
    }

    // Mark lesson as complete
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        xpEarned: lesson.xpReward,
        coinsEarned: lesson.coinReward,
        attempts: 1,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        xpEarned: lesson.xpReward,
        coinsEarned: lesson.coinReward,
        attempts: { increment: 1 },
      },
    });

    // Award XP and coins
    await awardXP(userId, lesson.xpReward, `Ders tamamlandı: ${lesson.title}`);
    await awardCoins(userId, lesson.coinReward);

    // Update course enrollment progress
    await updateCourseProgress(userId, lesson.chapter.courseId);

    // Create notification
    await db.notification.create({
      data: {
        userId,
        type: "LESSON_COMPLETED",
        title: "Ders Tamamlandı! ✅",
        message: `"${lesson.title}" dersini başarıyla tamamladınız. +${lesson.xpReward} XP kazandınız!`,
        data: { lessonId, xpEarned: lesson.xpReward, coinsEarned: lesson.coinReward },
      },
    });

    await checkAchievements(userId);
    revalidatePath(`/kurslar/${lesson.chapter.course.slug}`);

    return {
      success: true,
      xpEarned: lesson.xpReward,
      coinsEarned: lesson.coinReward,
    };
  } catch (error) {
    console.error("Complete lesson error:", error);
    return { error: "Ders tamamlanırken bir hata oluştu" };
  }
}

// ─── Update Course Progress ───────────────────────────────────────────────────

async function updateCourseProgress(userId: string, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        include: {
          lessons: {
            select: { id: true, isPublished: true },
            where: { isPublished: true },
          },
        },
      },
    },
  });

  if (!course) return;

  const allLessonIds = course.chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
  const totalLessons = allLessonIds.length;

  const completedCount = await db.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: allLessonIds },
      completed: true,
    },
  });

  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const completed = progress >= 100;

  const existingEnrollment = await db.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingEnrollment) {
    await db.courseEnrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { progress, completed, completedAt: completed ? new Date() : undefined },
    });
  }

  // Award course completion
  if (completed) {
    await db.notification.create({
      data: {
        userId,
        type: "COURSE_COMPLETED",
        title: "Kurs Tamamlandı! 🏆",
        message: `"${course.title}" kursunu tamamladınız! Sertifikanız hazır.`,
        data: { courseId },
      },
    });

    // Issue certificate
    await db.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    // Award bonus XP and coins
    await awardXP(userId, course.xpReward, `Kurs tamamlandı: ${course.title}`);
    await awardCoins(userId, course.coinReward);
  }
}

// ─── Claim Daily Reward ───────────────────────────────────────────────────────

export async function claimDailyReward() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor" };

  const userId = session.user.id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already claimed today
    const existing = await db.userDailyReward.findFirst({
      where: {
        userId,
        claimedAt: { gte: today },
      },
    });

    if (existing) {
      return { error: "Bugünkü ödülünüzü zaten aldınız" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    });

    if (!user) return { error: "Kullanıcı bulunamadı" };

    // Determine which day reward to give (based on streak, capped at 30)
    const day = Math.min(user.currentStreak, 30);
    const reward = await db.dailyReward.findUnique({ where: { day } });

    if (!reward) return { error: "Ödül bulunamadı" };

    // Claim reward
    await db.userDailyReward.create({
      data: { userId, day, claimedAt: new Date() },
    });

    await awardXP(userId, reward.xpReward, "Günlük ödül");
    await awardCoins(userId, reward.coinReward);

    await db.notification.create({
      data: {
        userId,
        type: "DAILY_REWARD",
        title: "Günlük Ödül Alındı! 🎁",
        message: `+${reward.coinReward} altın ve +${reward.xpReward} XP kazandınız!`,
        data: { coins: reward.coinReward, xp: reward.xpReward },
      },
    });

    revalidatePath("/panel");
    return { success: true, coins: reward.coinReward, xp: reward.xpReward };
  } catch (error) {
    console.error("Claim daily reward error:", error);
    return { error: "Ödül alınırken bir hata oluştu" };
  }
}

// ─── Check & Award Achievements ───────────────────────────────────────────────

export async function checkAchievements(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        achievements: { select: { achievementId: true } },
        lessonProgress: { where: { completed: true } },
        enrollments: { where: { completed: true } },
      },
    });

    if (!user) return;

    const allAchievements = await db.achievement.findMany();
    const unlockedIds = new Set(user.achievements.map((a) => a.achievementId));

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const condition = achievement.condition as {
        type: string;
        value: number;
        language?: string;
      };

      let shouldUnlock = false;

      switch (condition.type) {
        case "lessons_completed":
          shouldUnlock = user.lessonProgress.length >= condition.value;
          break;
        case "xp_earned":
          shouldUnlock = user.totalXpEarned >= condition.value;
          break;
        case "streak_days":
          shouldUnlock = user.currentStreak >= condition.value;
          break;
        case "courses_completed":
          shouldUnlock = user.enrollments.length >= condition.value;
          break;
        case "level_reached":
          shouldUnlock = user.level >= condition.value;
          break;
        case "coins_earned":
          shouldUnlock = user.totalCoinsEarned >= condition.value;
          break;
      }

      if (shouldUnlock) {
        await db.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });

        await awardXP(userId, achievement.xpReward, `Başarım: ${achievement.title}`);
        await awardCoins(userId, achievement.coinReward);

        await db.notification.create({
          data: {
            userId,
            type: "ACHIEVEMENT_UNLOCKED",
            title: "Yeni Başarım! 🏅",
            message: `"${achievement.title}" başarımını kazandınız!`,
            data: { achievementId: achievement.id },
          },
        });
      }
    }
  } catch (error) {
    console.error("Check achievements error:", error);
  }
}

// ─── Submit Code Challenge ────────────────────────────────────────────────────

export async function submitCodeChallenge(
  challengeId: string,
  code: string,
  language: string,
  passedTests: number,
  totalTests: number,
  executionTime: number
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor" };

  const userId = session.user.id;
  const passed = passedTests === totalTests && totalTests > 0;

  try {
    const submission = await db.codeSubmission.create({
      data: {
        userId,
        challengeId,
        code,
        language,
        passed,
        passedTests,
        totalTests,
        executionTime,
      },
    });

    if (passed) {
      const challenge = await db.codeChallenge.findUnique({
        where: { id: challengeId },
        select: { lessonId: true },
      });

      if (challenge?.lessonId) {
        await completeLesson(challenge.lessonId);
      }
    }

    return { success: true, passed, submissionId: submission.id };
  } catch (error) {
    console.error("Submit challenge error:", error);
    return { error: "Kod gönderilirken bir hata oluştu" };
  }
}

// ─── Enroll In Course ─────────────────────────────────────────────────────────

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor" };

  const userId = session.user.id;

  try {
    await db.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    revalidatePath("/kurslar");
    return { success: true };
  } catch (error) {
    console.error("Enroll error:", error);
    return { error: "Kursa kaydolurken bir hata oluştu" };
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfile(data: {
  name: string;
  username: string;
  bio: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor" };

  const userId = session.user.id;

  try {
    const existingUsername = await db.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
    });

    if (existingUsername) {
      return { error: "Bu kullanıcı adı zaten kullanılıyor" };
    }

    await db.user.update({
      where: { id: userId },
      data: { name: data.name, username: data.username, bio: data.bio },
    });

    revalidatePath("/profil");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Profil güncellenirken bir hata oluştu" };
  }
}

// ─── Mark Notifications Read ──────────────────────────────────────────────────

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/panel");
}
