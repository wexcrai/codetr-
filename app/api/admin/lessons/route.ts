import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");

    const where = {
      ...(chapterId ? { chapterId } : courseId ? { chapter: { courseId } } : {})
    };

    const lessons = await db.lesson.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        chapter: {
          select: { courseId: true }
        }
      }
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("[ADMIN_LESSONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "MODERATOR") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { title, description, chapterId, type, order, xpReward, coinReward, estimatedTime, isPublished } = body;

    if (!title || !chapterId || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lesson = await db.lesson.create({
      data: {
        title,
        description,
        chapterId,
        type,
        order: Number(order) || 1,
        xpReward: Number(xpReward) || 10,
        coinReward: Number(coinReward) || 0,
        estimatedTime: Number(estimatedTime) || 5,
        isPublished: isPublished || false,
      }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[ADMIN_LESSONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
