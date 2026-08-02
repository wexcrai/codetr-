import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Calendar, Video, Users, Clock, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Etkinlik Takvimi & Canlı Yayınlar | CodeTR",
  description: "Topluluk atölyeleri, canlı yayınlar ve yazılım webinarları.",
};

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const EVENTS = [
    {
      id: "ev-1",
      title: "🚀 Python & AI İle Yapay Zeka Uygulamaları Geliştirme",
      speaker: "CodeTR Kıdemli Eğitmen Ekibi",
      date: "05 Ağustos 2026",
      time: "20:00 - 21:30",
      type: "CANLI ATÖLYE",
      status: "YAKINDA",
    },
    {
      id: "ev-2",
      title: "⚔️ Canlı 1v1 Kod Düellosu Şampiyonası Finali",
      speaker: "CodeTR Şampiyonları",
      date: "12 Ağustos 2026",
      time: "21:00 - 22:30",
      type: "YARIŞMA",
      status: "YAKINDA",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold shadow-lg">
          <Calendar className="w-4 h-4 text-cyan-400" /> Canlı Topluluk Etkinlikleri
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Etkinlik Takvimi &amp; <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Yayınlar</span>
        </h1>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          Canlı yayınlar, webinarlar ve topluluk kodlama buluşmaları.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {EVENTS.map((ev) => (
          <div key={ev.id} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
                  {ev.type}
                </span>
                <span className="text-[10px] text-amber-400 font-bold">{ev.status}</span>
              </div>
              <h3 className="text-base font-extrabold text-white">{ev.title}</h3>
              <p className="text-xs text-slate-400">Konuşmacı: <strong className="text-slate-200">{ev.speaker}</strong></p>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-cyan-400" /> {ev.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-400" /> {ev.time}</span>
              </div>
            </div>

            <button className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 shrink-0">
              <Video className="w-4 h-4" />
              <span>Hatırlatıcı Ekle</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
