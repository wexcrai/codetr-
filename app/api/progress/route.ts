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

    // Get course progress
    const enrollments = await db.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: { title: true, slug: true, icon: true, color: true }
        }
      }
    });

    // Get recent activity
    const recentActivity = await db.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        recentActivity
      }
    });

  } catch (error) {
    console.error("Progress GET Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { lessonId, status, xpEarned = 0, coinsEarned = 0 } = body;

    if (!lessonId) {
      return NextResponse.json({ success: false, error: "Ders ID gerekli" }, { status: 400 });
    }

    const completed = status === "completed";

    const progress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        xpEarned: { increment: xpEarned },
        coinsEarned: { increment: coinsEarned },
        attempts: { increment: 1 }
      },
      create: {
        userId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
        xpEarned,
        coinsEarned,
        attempts: 1
      }
    });

    if (completed) {
      await db.userActivity.create({
        data: {
          userId,
          action: "lesson_completed",
          xpEarned,
          data: { lessonId }
        }
      });
      
      // Update user xp and coins
      await db.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          totalXpEarned: { increment: xpEarned },
          coins: { increment: coinsEarned },
          totalCoinsEarned: { increment: coinsEarned }
        }
      });
    }

    return NextResponse.json({ success: true, data: progress });

  } catch (error) {
    console.error("Progress POST Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
