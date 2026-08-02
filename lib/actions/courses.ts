"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Anahtar İle Kursa Kayıt Ol ────────────────────────────────────────────────
export async function enrollCourse(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const courseId = formData.get("courseId") as string;
  const accessKeyInput = (formData.get("accessKey") as string || "").trim().toUpperCase();

  if (!courseId) throw new Error("courseId gerekli");

  const course = await db.course.findUnique({
    where: { id: courseId, isPublished: true },
  });
  if (!course) throw new Error("Kurs bulunamadı");

  // Admin bypass check (Optional: if user is admin, allow quick enrollment with message if no key entered)
  const isUserAdmin = (session.user as any).role === "ADMIN";

  if (!accessKeyInput && !isUserAdmin) {
    redirect(`/kurslar/${course.slug}?error=${encodeURIComponent("Kursa kayıt olmak için geçerli bir Erişim Anahtarı (Key) girmelisiniz.")}`);
  }

  if (accessKeyInput) {
    const accessKey = await db.accessKey.findUnique({
      where: { key: accessKeyInput },
    });

    if (!accessKey) {
      redirect(`/kurslar/${course.slug}?error=${encodeURIComponent("Geçersiz erişim anahtarı (Key). Lütfen doğru bir anahtar girin.")}`);
    }

    if (accessKey.status !== "ACTIVE") {
      redirect(`/kurslar/${course.slug}?error=${encodeURIComponent("Bu erişim anahtarı artık aktif değil.")}`);
    }

    if (accessKey.usedCount >= accessKey.maxUses) {
      redirect(`/kurslar/${course.slug}?error=${encodeURIComponent("Bu erişim anahtarının kullanım limiti dolmuştur.")}`);
    }

    if (accessKey.expiresAt && accessKey.expiresAt < new Date()) {
      redirect(`/kurslar/${course.slug}?error=${encodeURIComponent("Bu erişim anahtarının süresi dolmuş.")}`);
    }

    // Key course matching check
    if (
      accessKey.type === "COURSE_ACCESS" &&
      accessKey.courseId &&
      accessKey.courseId !== course.id &&
      accessKey.courseId !== course.slug
    ) {
      redirect(`/kurslar/${course.slug}?error=${encodeURIComponent("Bu anahtar farklı bir kurs için tanımlanmış.")}`);
    }

    // Transaction for key redemption + enrollment
    await db.$transaction(async (tx) => {
      // Record redemption if not already redeemed
      const existing = await tx.keyRedemption.findUnique({
        where: { keyId_userId: { keyId: accessKey.id, userId: session.user.id } }
      });

      if (!existing) {
        await tx.keyRedemption.create({
          data: { keyId: accessKey.id, userId: session.user.id }
        });

        const newCount = accessKey.usedCount + 1;
        await tx.accessKey.update({
          where: { id: accessKey.id },
          data: {
            usedCount: newCount,
            status: newCount >= accessKey.maxUses ? "USED" : "ACTIVE"
          }
        });
      }

      await tx.courseEnrollment.upsert({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        update: {},
        create: { userId: session.user.id, courseId: course.id, progress: 0 },
      });

      await tx.notification.create({
        data: {
          userId: session.user.id,
          title: "Kursa Kaydoldun! 🎉",
          message: `${course.title} kursuna başarıyla kaydoldun. İyi öğrenmeler!`,
          type: "SYSTEM",
        },
      });
    });
  } else if (isUserAdmin) {
    // Admin direct enrollment
    await db.courseEnrollment.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      update: {},
      create: { userId: session.user.id, courseId: course.id, progress: 0 },
    });
  }

  revalidatePath(`/kurslar/${course.slug}`);
  revalidatePath("/kurslar");
  revalidatePath("/panel");

  redirect(`/kurslar/${course.slug}`);
}

// ─── Ders İlerlemesini Kaydet ─────────────────────────────────────────────────
export async function completeLessonAction(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Giriş gerekli" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { select: { courseId: true } } },
  });
  if (!lesson) return { error: "Ders bulunamadı" };

  const courseId = lesson.chapter.courseId;

  // Upsert lesson progress
  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  if (!existing?.completed) {
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: { completed: true, completedAt: new Date(), xpEarned: lesson.xpReward, coinsEarned: lesson.coinReward },
      create: {
        userId: session.user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
        xpEarned: lesson.xpReward,
        coinsEarned: lesson.coinReward,
      },
    });

    // Award XP & coins to user
    await db.user.update({
      where: { id: session.user.id },
      data: {
        xp: { increment: lesson.xpReward },
        totalXpEarned: { increment: lesson.xpReward },
        coins: { increment: lesson.coinReward },
      },
    });

    // Update course progress
    await updateCourseProgress(session.user.id, courseId);
  }

  revalidatePath(`/ders/${lessonId}`);
  revalidatePath(`/kurslar`);
  revalidatePath("/panel");

  return { success: true, xpEarned: lesson.xpReward, coinsEarned: lesson.coinReward };
}

// ─── Kurs ilerlemesini hesapla ve güncelle ─────────────────────────────────────
async function updateCourseProgress(userId: string, courseId: string) {
  const [totalLessons, completedLessons] = await Promise.all([
    db.lesson.count({
      where: { chapter: { courseId }, isPublished: true },
    }),
    db.lessonProgress.count({
      where: { userId, completed: true, lesson: { chapter: { courseId } } },
    }),
  ]);

  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completed = progress >= 100;

  await db.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { progress, completed, completedAt: completed ? new Date() : null },
    create: { userId, courseId, progress, completed },
  });
}

// ─── Sonraki dersi bul ────────────────────────────────────────────────────────
export async function getNextLesson(currentLessonId: string) {
  const current = await db.lesson.findUnique({
    where: { id: currentLessonId },
    include: { chapter: { select: { order: true, courseId: true } } },
  });
  if (!current) return null;

  // Aynı bölümde sonraki ders
  const nextInChapter = await db.lesson.findFirst({
    where: {
      chapterId: current.chapterId,
      order: { gt: current.order },
      isPublished: true,
    },
    orderBy: { order: "asc" },
  });
  if (nextInChapter) return nextInChapter;

  // Sonraki bölümün ilk dersi
  const nextChapter = await db.chapter.findFirst({
    where: {
      courseId: current.chapter.courseId,
      order: { gt: current.chapter.order },
      isPublished: true,
    },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
  });
  return nextChapter?.lessons[0] ?? null;
}
