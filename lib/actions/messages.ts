"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendDirectMessage(receiverId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;

  if (!message.trim()) {
    return { success: false, error: "Mesaj boş olamaz." };
  }

  try {
    const dm = await db.directMessage.create({
      data: {
        senderId: userId,
        receiverId,
        message: message.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, userTag: true, image: true } },
      },
    });

    revalidatePath("/mesajlar");
    return { success: true, message: dm };
  } catch (err) {
    console.error("sendDirectMessage error:", err);
    return { success: false, error: "Mesaj gönderilirken hata oluştu." };
  }
}

export async function getDirectMessages(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  return db.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, username: true, userTag: true, image: true } },
    },
  });
}
