"use server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getLessonWithSteps(lessonId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        codeChallenge: { include: { testCases: { orderBy: { order: 'asc' } } } },
        hints: { orderBy: { order: 'asc' } },
        progress: userId ? { where: { userId } } : false,
        chapter: {
          include: {
            course: true,
            lessons: { orderBy: { order: 'asc' }, select: { id: true, order: true, title: true } }
          }
        }
      }
    });

    if (!lesson) return null;

    // Find prev/next
    const siblings = lesson.chapter.lessons;
    const idx = siblings.findIndex((l: any) => l.id === lessonId);
    const prevLesson = idx > 0 ? siblings[idx - 1] : null;
    const nextLesson = idx < siblings.length - 1 ? siblings[idx + 1] : null;

    return { lesson, prevLesson, nextLesson, courseSlug: lesson.chapter.course.slug };
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return null;
  }
}

export async function completeLesson(lessonId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      redirect("/giris");
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } }
    });

    if (!lesson) throw new Error("Lesson not found");

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const existingProgress = await db.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } }
    });

    let xpEarned = 0;
    let coinsEarned = 0;

    // Only award XP and coins if not already completed
    if (!existingProgress?.completed) {
      xpEarned = lesson.xpReward || 0;
      coinsEarned = lesson.coinReward || 0;
    }

    const newTotalXp = (user.totalXpEarned || 0) + xpEarned;
    const newXp = (user.xp || 0) + xpEarned;
    const newCoins = (user.coins || 0) + coinsEarned;
    const newTotalCoins = (user.totalCoinsEarned || 0) + coinsEarned;
    
    // level = Math.floor(Math.sqrt(newTotalXp / 100)) + 1, capped at 100
    let newLevel = Math.floor(Math.sqrt(newTotalXp / 100)) + 1;
    if (newLevel > 100) newLevel = 100;

    await db.$transaction(async (tx) => {
      // Upsert LessonProgress
      await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { completed: true, completedAt: new Date() },
        create: { userId, lessonId, completed: true, completedAt: new Date() }
      });

      if (xpEarned > 0 || coinsEarned > 0) {
        // Update user
        await tx.user.update({
          where: { id: userId },
          data: {
            xp: newXp,
            coins: newCoins,
            totalXpEarned: newTotalXp,
            totalCoinsEarned: newTotalCoins,
            level: newLevel,
          }
        });

        // Create Notification
        await tx.notification.create({
          data: {
            userId,
            type: "LESSON_COMPLETED",
            title: "Ders Tamamlandı!",
            message: `${lesson.title} dersini tamamladın! +${xpEarned} XP, +${coinsEarned} Altın kazandın.`
          }
        });
      }

      // Update CourseEnrollment progress if enrolled
      const courseId = lesson.chapter.courseId;
      const totalLessons = await tx.lesson.count({
        where: { chapter: { courseId } }
      });
      const completedLessons = await tx.lessonProgress.count({
        where: { userId, lesson: { chapter: { courseId } }, completed: true }
      });

      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      const existingEnrollment = await tx.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (existingEnrollment) {
        await tx.courseEnrollment.update({
          where: { userId_courseId: { userId, courseId } },
          data: { progress },
        });
      }
    });

    revalidatePath(`/kurslar/${lesson.chapter.course.slug}`);
    
    return {
      success: true,
      xpEarned,
      coinsEarned,
      newXP: newXp,
      newLevel,
      leveledUp: newLevel > user.level
    };
  } catch (error) {
    console.error("Error completing lesson:", error);
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { success: false, error: "Ders tamamlanamadı." };
  }
}

export async function submitChallenge(lessonId: string, code: string, passed: boolean, passedTests: number, totalTests: number) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      redirect("/giris");
    }

    const codeChallenge = await db.codeChallenge.findUnique({
      where: { lessonId }
    });

    if (!codeChallenge) {
      throw new Error("Challenge not found");
    }

    await db.codeSubmission.create({
      data: {
        userId,
        challengeId: codeChallenge.id,
        code,
        language: "python",
        passed,
        passedTests,
        totalTests
      }
    });

    if (passed) {
      return await completeLesson(lessonId);
    }

    return { success: true, passed: false };
  } catch (error) {
    console.error("Error submitting challenge:", error);
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { success: false, error: "Gönderim başarısız." };
  }
}
