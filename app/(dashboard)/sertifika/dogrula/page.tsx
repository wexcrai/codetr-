import { db } from "@/lib/db";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sertifika Doğrulama | CodeTR" };

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0">
      <span className="text-slate-400">{label}:</span>
      <span className={`font-semibold text-white ${mono ? 'font-mono text-xs text-amber-400' : ''}`}>{value}</span>
    </div>
  );
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-6 pt-12">
        <ShieldCheck className="h-16 w-16 text-amber-400 mx-auto" />
        <h1 className="text-2xl font-bold text-white">Sertifika Doğrulama</h1>
        <p className="text-slate-400 text-sm">Lütfen doğrulanacak sertifika kodunu girin.</p>
      </div>
    );
  }

  const certificate = await db.certificate.findFirst({
    where: {
      OR: [
        { verificationId: id },
        { id: id }
      ]
    },
    include: {
      user: { select: { name: true, username: true } },
      course: { select: { title: true, language: true, icon: true } },
    },
  });

  const isValid = !!certificate;

  return (
    <div className="max-w-lg mx-auto p-8 text-center space-y-6 pt-12">
      <div className="flex justify-center">
        <ShieldCheck className="h-16 w-16 text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold text-white">Sertifika Doğrulama</h1>

      {isValid && certificate ? (
        <>
          <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-bold">Resmi Geçerli Sertifika</span>
          </div>
          <div className="space-y-2 text-left rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-md">
            <Row label="Öğrenci Adı" value={certificate.user.name ?? certificate.user.username ?? "Öğrenci"} />
            <Row label="Tamamlanan Kurs" value={certificate.course.title} />
            <Row label="Veriliş Tarihi" value={certificate.issuedAt.toLocaleDateString('tr-TR')} />
            <Row label="Sertifika Kodu" value={certificate.verificationId} mono />
          </div>
          <p className="text-xs text-slate-400">
            Bu sertifika CodeTR Resmi Eğitim Kurulu tarafından doğrulanmıştır.
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
            <XCircle className="h-5 w-5" />
            <span className="text-sm font-bold">Geçersiz Sertifika Kodu</span>
          </div>
          <p className="text-xs text-slate-400">
            Girdiğiniz sertifika kodu ile eşleşen bir kayıt bulunamadı.
          </p>
        </>
      )}
    </div>
  );
}
