"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSupportTicket(data: {
  subject: string;
  category: string;
  message: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmanız gerekiyor." };
  }

  const userId = session.user.id;

  if (!data.subject.trim() || !data.message.trim()) {
    return { success: false, error: "Lütfen konu başlığı ve mesaj alanlarını doldurun." };
  }

  try {
    const ticket = await db.supportTicket.create({
      data: {
        userId,
        subject: data.subject.trim(),
        category: data.category || "TEKNIK",
        message: data.message.trim(),
        priority: data.priority || "MEDIUM",
        status: "OPEN",
      },
    });

    revalidatePath("/destek");
    return { success: true, message: "Destek talebiniz başarıyla oluşturuldu! Destek ekibimiz en kısa sürede yanıtlayacaktır.", ticketId: ticket.id };
  } catch (err) {
    console.error("createSupportTicket error:", err);
    return { success: false, error: "Destek talebi oluşturulurken bir hata oluştu." };
  }
}

export async function getUserSupportTickets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function replyAndResolveTicketAdmin(data: {
  ticketId: string;
  adminReply: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Yetkisiz erişim." };
  }

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin) {
    return { success: false, error: "Bu işlem için admin yetkisi gerekiyor." };
  }

  try {
    const ticket = await db.supportTicket.update({
      where: { id: data.ticketId },
      data: {
        adminReply: data.adminReply.trim(),
        status: data.status,
      },
    });

    // Create notification for ticket owner
    await db.notification.create({
      data: {
        userId: ticket.userId,
        title: "Destek Talebiniz Yanıtlandı! 🎧",
        message: `'${ticket.subject}' konulu destek talebinize yanıt verildi.`,
        type: "SYSTEM",
      },
    });

    revalidatePath("/destek");
    revalidatePath("/admin/destek");
    return { success: true, message: "Destek talebi başarıyla yanıtlandı ve güncellendi." };
  } catch (err) {
    console.error("replyAndResolveTicketAdmin error:", err);
    return { success: false, error: "Yanıt kaydedilirken bir hata oluştu." };
  }
}
