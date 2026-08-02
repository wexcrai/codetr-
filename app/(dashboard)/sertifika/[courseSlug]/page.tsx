import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Award, ShieldCheck, ArrowLeft } from "lucide-react";
import { CertificateClient } from "./certificate-client";

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = await db.course.findUnique({ where: { slug: courseSlug }, select: { title: true } });
  return {
    title: course ? `${course.title} Başarı Sertifikası | CodeTR` : "Sertifika | CodeTR",
  };
}

export default async function CertificatePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const course = await db.course.findUnique({
    where: { slug: courseSlug },
  });

  if (!course) notFound();

  // Check enrollment & progress
  const [enrollment, user] = await Promise.all([
    db.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, username: true },
    }),
  ]);

  const isAdmin = (session.user as any).role === "ADMIN";

  // Check if course is completed (or admin preview)
  if (!isAdmin && (!enrollment || enrollment.progress < 100)) {
    redirect(`/kurslar/${courseSlug}?error=${encodeURIComponent("Sertifika alabilmek için bu kursu %100 tamamlamalısınız!")}`);
  }

  // Get or create certificate record in DB
  let certificate = await db.certificate.findFirst({
    where: { userId, courseId: course.id },
  });

  if (!certificate) {
    const certCode = `CTR-CERT-${course.language.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    certificate = await db.certificate.create({
      data: {
        userId,
        courseId: course.id,
        verificationId: certCode,
        issuedAt: new Date(),
      },
    });
  }

  const issueDateFormatted = certificate.issuedAt.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const studentName = user?.name || user?.username || "CodeTR Öğrencisi";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Link
          href={`/kurslar/${courseSlug}`}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kursa Dön
        </Link>
        <CertificateClient />
      </div>

      {/* Official Certificate Card */}
      <div
        id="certificate-print-area"
        className="rounded-3xl border-4 border-amber-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-14 relative overflow-hidden shadow-2xl text-center space-y-8"
      >
        {/* Certificate Background Ornaments */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-amber-500/60 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-amber-500/60 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-amber-500/60 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-amber-500/60 rounded-br-3xl" />

        {/* Certificate Title */}
        <div className="space-y-3 pt-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Award className="w-9 h-9" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] font-extrabold text-amber-400">
            CodeTR Resmi Başarı Sertifikası
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif">
            BAŞARI SERTİFİKASI
          </h1>
        </div>

        {/* Presented To */}
        <div className="space-y-2 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Bu sertifika gururla verilmiştir</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 py-1">
            {studentName}
          </h2>
          <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-2 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            Sayın <strong className="text-white">{studentName}</strong>, CodeTR platformunda yer alan{" "}
            <strong className="text-amber-400">{course.title}</strong> eğitim programını ve pratik alıştırmaları
            başarıyla tamamlayarak bu sertifikayı almaya hak kazanmıştır.
          </p>
        </div>

        {/* Seals & Signatures Footer */}
        <div className="pt-8 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-xs text-slate-400">
          <div>
            <p className="font-bold text-white text-sm">Veriliş Tarihi</p>
            <p className="mt-1 text-slate-300">{issueDateFormatted}</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="font-mono text-[11px] text-amber-400 font-bold tracking-widest">
              {certificate.verificationId}
            </p>
            <p className="text-[10px] text-slate-500">Doğrulanmış Dijital Sertifika</p>
          </div>

          <div>
            <p className="font-bold text-white text-sm">CodeTR Eğitim Kurulu</p>
            <p className="mt-1 text-slate-300">Resmi Onaylı Belge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
