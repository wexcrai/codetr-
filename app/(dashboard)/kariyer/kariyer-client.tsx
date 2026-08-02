'use client';

import { Printer, ShieldCheck, Award, Briefcase, FileText, CheckCircle2 } from 'lucide-react';

interface KariyerClientProps {
  user: any;
  certificates: any[];
  completedCourses: any[];
}

export function KariyerClient({ user, certificates, completedCourses }: KariyerClientProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
        >
          <Printer className="w-4 h-4" /> CV'yi Yazdır / PDF İndir
        </button>
      </div>

      {/* Printable CV Paper Card */}
      <div
        id="cv-print-area"
        className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-slate-950 space-y-8 shadow-2xl text-slate-200"
      >
        {/* CV Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">{user?.name || user?.username || 'Yazılımcı'}</h1>
            <p className="text-xs font-mono text-purple-400 font-bold mt-1">{user?.userTag || '@kullanici'} • Yazılım Geliştirici</p>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-1">
            <span className="text-[10px] text-slate-400 block">CodeTR Seviye Status</span>
            <span className="text-lg font-extrabold text-yellow-400">Seviye {user?.level} • {user?.xp} XP</span>
            {user?.equippedBadge && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 block mt-1">
                {user?.equippedBadge}
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {user?.bio && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Hakkımda</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-4 rounded-xl border border-slate-800">{user.bio}</p>
          </div>
        )}

        {/* Completed Courses & Certifications */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Tamamlanan Eğitimler &amp; Sertifikalar
          </h2>

          {certificates.length === 0 && completedCourses.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Henüz tamamlanmış kurs sertifikası bulunmuyor.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{cert.course.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] font-mono text-amber-400">{cert.verificationId}</p>
                  <p className="text-[10px] text-slate-500">Veriliş: {new Date(cert.issuedAt).toLocaleDateString('tr-TR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technical Skills */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" /> Teknik Yetenekler
          </h2>

          <div className="flex flex-wrap gap-2 text-xs">
            {['Python 3.x', 'JavaScript ES6+', 'TypeScript', 'HTML5 & CSS3', 'SQL & Veritabanı', 'Algoritma & Veri Yapıları', 'OOP Nesne Yönelimli Programlama'].map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300 font-semibold">
                ✓ {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Verification Seal Footer */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
          <span>CodeTR Resmi Yazılımcı Özgeçmiş Raporu</span>
          <span className="font-mono text-purple-400">Doğrulanmış Profil ID: {user?.userTag}</span>
        </div>
      </div>
    </div>
  );
}
