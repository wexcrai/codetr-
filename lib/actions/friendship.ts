"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function generateUniqueTag(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CTR-${num}`;
}

export async function getUserFriendshipData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  let user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      userTag: true,
      username: true,
      name: true,
      image: true,
    },
  });

  if (!user) return null;

  // Auto-generate unique CodeTR Tag if not exists
  if (!user.userTag) {
    let newTag = generateUniqueTag();
    let isUnique = false;
    while (!isUnique) {
      const existing = await db.user.findUnique({ where: { userTag: newTag } });
      if (!existing) isUnique = true;
      else newTag = generateUniqueTag();
    }

    user = await db.user.update({
      where: { id: userId },
      data: { userTag: newTag },
      select: {
        id: true,
        userTag: true,
        username: true,
        name: true,
        image: true,
      },
    });
  }

  // Fetch pending requests & friendships
  const [pendingRequests, friendships] = await Promise.all([
    db.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, name: true, username: true, userTag: true, image: true, level: true, xp: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: { id: true, name: true, username: true, userTag: true, image: true, level: true, xp: true, currentStreak: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    userTag: user.userTag,
    username: user.username || user.name || "Kullanıcı",
    friends: friendships.map((f) => f.friend),
    pendingRequests,
  };
}

export async function sendFriendRequest(targetInput: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;
  const cleanTarget = targetInput.trim().replace(/^@/, "");

  if (!cleanTarget) {
    return { success: false, error: "Lütfen geçerli bir CodeTR Kimliği (Tag/Kullanıcı Adı) girin." };
  }

  // Find target user by userTag, username, or email
  const targetUser = await db.user.findFirst({
    where: {
      OR: [
        { userTag: cleanTarget.toUpperCase() },
        { username: cleanTarget.toLowerCase() },
        { email: cleanTarget.toLowerCase() },
      ],
    },
  });

  if (!targetUser) {
    return { success: false, error: `'${targetInput}' kimliğine sahip kullanıcı bulunamadı.` };
  }

  if (targetUser.id === userId) {
    return { success: false, error: "Kendi kendinize arkadaşlık isteği gönderemezsiniz." };
  }

  // Check if already friends
  const existingFriendship = await db.friendship.findUnique({
    where: { userId_friendId: { userId, friendId: targetUser.id } },
  });

  if (existingFriendship) {
    return { success: false, error: "Bu kullanıcı ile zaten arkadaşsınız!" };
  }

  // Check existing friend request
  const existingRequest = await db.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: targetUser.id },
        { senderId: targetUser.id, receiverId: userId },
      ],
    },
  });

  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      return { success: false, error: "Zaten beklemede olan bir arkadaşlık isteği var." };
    }
  }

  // Create friend request
  try {
    await db.$transaction(async (tx) => {
      await tx.friendRequest.create({
        data: {
          senderId: userId,
          receiverId: targetUser.id,
          status: "PENDING",
        },
      });

      const senderUser = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true, username: true },
      });

      await tx.notification.create({
        data: {
          userId: targetUser.id,
          title: "Yeni Arkadaşlık İsteği! 👥",
          message: `${senderUser?.name || "Bir kullanıcı"} sana arkadaşlık isteği gönderdi.`,
          type: "SYSTEM",
        },
      });
    });
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    return { success: false, error: "İstek gönderilirken bir hata oluştu." };
  }

  revalidatePath("/sosyal");
  return { success: true, message: `${targetUser.name || targetUser.userTag} kullanıcısına arkadaşlık isteği gönderildi!` };
}

export async function respondFriendRequest(requestId: string, accept: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;

  const request = await db.friendRequest.findUnique({
    where: { id: requestId },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  if (!request || request.receiverId !== userId) {
    return { success: false, error: "İstek bulunamadı veya yetkiniz yok." };
  }

  try {
    if (accept) {
      await db.$transaction(async (tx) => {
        // Update request status
        await tx.friendRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" },
        });

        // Create reciprocal friendships
        await tx.friendship.upsert({
          where: { userId_friendId: { userId, friendId: request.senderId } },
          update: {},
          create: { userId, friendId: request.senderId },
        });

        await tx.friendship.upsert({
          where: { userId_friendId: { userId: request.senderId, friendId: userId } },
          update: {},
          create: { userId: request.senderId, friendId: userId },
        });

        const receiverUser = await tx.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        // Notify sender
        await tx.notification.create({
          data: {
            userId: request.senderId,
            title: "Arkadaşlık İsteğin Kabul Edildi! 🎉",
            message: `${receiverUser?.name || "Kullanıcı"} arkadaşlık isteğini kabul etti.`,
            type: "SYSTEM",
          },
        });
      });
    } else {
      await db.friendRequest.delete({
        where: { id: requestId },
      });
    }
  } catch (err) {
    console.error("respondFriendRequest error:", err);
    return { success: false, error: "İşlem sırasında bir hata oluştu." };
  }

  revalidatePath("/sosyal");
  return { success: true, message: accept ? "Arkadaşlık isteği kabul edildi!" : "İstek reddedildi." };
}
