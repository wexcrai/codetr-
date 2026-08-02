import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const courses = await db.course.findMany({
      orderBy: { order: "asc" },
      include: {
        chapters: {
          include: { lessons: true }
        }
      }
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("[ADMIN_COURSES_GET]", error);
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
    const { title, description, shortDesc, language, level, icon, color, isPublished, order } = body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const course = await db.course.create({
      data: {
        title,
        slug,
        description,
        shortDesc,
        language,
        level,
        icon,
        color,
        isPublished,
        order: Number(order) || 0,
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[ADMIN_COURSES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
