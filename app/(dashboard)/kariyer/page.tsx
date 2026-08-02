import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { KariyerClient } from "./kariyer-client";
import { Briefcase, Award, ShieldCheck, Printer, FileText, Sparkles } from "lucide-react";

export const metadata = {
  title: "AI Kariyer Rehberi & Yazılımcı CV | CodeTR",
  description: "Tamamladığın kurslar ve başarılarınla 1-tıkla resmi PDF Yazılımcı CV'ni oluştur.",
};

export default async function CareerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [user, certificates, enrollments] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, username: true, userTag: true, xp: true, level: true, bio: true, equippedBadge: true, createdAt: true },
    }),
    db.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true, language: true } } },
    }),
    db.courseEnrollment.findMany({
      where: { userId, progress: { gte: 100 } },
      include: { course: { select: { title: true, language: true } } },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4 print:hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold shadow-lg">
          <Briefcase className="w-4 h-4 text-blue-400" /> AI Otomatik Yazılımcı CV &amp; Kariyer
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Yazılımcı <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">Özgeçmişi (CV)</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Sistemdeki tüm başarılarınız, doğrulanan sertifikalarınız ve kodlama istatistiklerinizle hazırlanmış resmi CV.
        </p>
      </div>

      <KariyerClient user={user} certificates={certificates} completedCourses={enrollments} />
    </div>
  );
}
