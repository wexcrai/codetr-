import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Search courses
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDesc: true,
        icon: true,
        color: true,
      },
      take: 5
    });

    // Search lessons
    const lessons = await db.lesson.findMany({
      where: {
        isPublished: true,
        title: { contains: query, mode: 'insensitive' }
      },
      select: {
        id: true,
        title: true,
        type: true,
        chapter: {
          select: {
            title: true,
            course: {
              select: {
                slug: true,
                title: true,
              }
            }
          }
        }
      },
      take: 10
    });

    // Combine results
    const results = [
      ...courses.map(c => ({
        ...c,
        resultType: 'course',
        url: `/courses/${c.slug}`
      })),
      ...lessons.map(l => ({
        id: l.id,
        title: l.title,
        description: `${l.chapter.course.title} > ${l.chapter.title}`,
        type: l.type,
        resultType: 'lesson',
        url: `/courses/${l.chapter.course.slug}/lessons/${l.id}`
      }))
    ];

    return NextResponse.json({ success: true, data: results });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: "Arama sırasında bir hata oluştu" }, { status: 500 });
  }
}
