"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addLessonComment(lessonId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Yorum yapmak için giriş yapmalısınız." };
  }

  if (!content.trim()) {
    return { success: false, error: "Yorum içeriği boş olamaz." };
  }

  try {
    const comment = await db.lessonComment.create({
      data: {
        lessonId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { name: true, username: true, userTag: true, image: true, equippedBadge: true } },
      },
    });

    revalidatePath(`/kurslar`);
    return { success: true, message: "Yorumunuz toplulukla paylaşıldı!", comment };
  } catch (err) {
    console.error("addLessonComment error:", err);
    return { success: false, error: "Yorum kaydedilirken hata oluştu." };
  }
}

export async function getLessonComments(lessonId: string) {
  return db.lessonComment.findMany({
    where: { lessonId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, username: true, userTag: true, image: true, equippedBadge: true, level: true } },
    },
  });
}
