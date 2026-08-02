import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: [
        { read: "asc" },
        { createdAt: "desc" }
      ],
      skip,
      take: limit,
    });

    const unreadCount = await db.notification.count({
      where: { userId, read: false }
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: {
        unreadCount,
        page,
        limit
      }
    });

  } catch (error) {
    console.error("Notifications GET Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      });
      return NextResponse.json({ success: true, message: "Tümü okundu olarak işaretlendi" });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ success: false, error: "Bildirim ID'leri geçersiz" }, { status: 400 });
    }

    await db.notification.updateMany({
      where: { 
        id: { in: notificationIds },
        userId 
      },
      data: { read: true }
    });

    return NextResponse.json({ success: true, message: "Bildirimler güncellendi" });

  } catch (error) {
    console.error("Notifications PATCH Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
