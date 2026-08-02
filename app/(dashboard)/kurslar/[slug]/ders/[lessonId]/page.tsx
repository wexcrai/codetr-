import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { LessonClient } from "./lesson-client";

export default async function InteractiveLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  // Fetch course
  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
    select: { id: true, title: true, slug: true, language: true, color: true },
  });

  if (!course) notFound();

  // Check enrollment
  const enrollment = await db.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  if (!enrollment && (session.user as any).role !== "ADMIN") {
    redirect(`/kurslar/${slug}?error=${encodeURIComponent("Derslere erişmek için önce kursa kaydolmalısınız.")}`);
  }

  // Fetch lesson with details
  const lesson = await db.lesson.findFirst({
    where: {
      OR: [{ id: lessonId }, { id: lessonId }],
      chapter: { courseId: course.id },
      isPublished: true,
    },
    include: {
      chapter: { select: { title: true } },
      steps: { orderBy: { order: "asc" } },
      codeChallenge: true,
      hints: { orderBy: { order: "asc" } },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, username: true, userTag: true, image: true, equippedBadge: true } },
        },
      },
    },
  });

  if (!lesson) notFound();

  // Fetch lesson progress
  const progressRecord = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });

  return (
    <LessonClient
      user={session.user}
      course={course}
      lesson={lesson}
      isCompleted={progressRecord?.completed ?? false}
    />
  );
}
