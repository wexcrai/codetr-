"use client";

import { BarChart3, Download, TrendingUp, Users, Clock } from "lucide-react";

export default function AdminStatisticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">İstatistikler</h1>
          <p className="text-slate-400 mt-1">Platformun analitik verilerini detaylı inceleyin.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500">
            <option>Son 7 Gün</option>
            <option>Son 30 Gün</option>
            <option>Bu Yıl</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            Rapor İndir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Elde Tutma Oranı</div>
              <div className="text-2xl font-bold text-white">%42.5</div>
            </div>
          </div>
          <div className="text-xs text-green-400 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Geçen haftaya göre %5 artış</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Ort. Oturum Süresi</div>
              <div className="text-2xl font-bold text-white">14 dk 20 sn</div>
            </div>
          </div>
          <div className="text-xs text-slate-400">Aktif kullanıcılar baz alınmıştır</div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-slate-800 bg-slate-900/50 text-center py-20">
        <BarChart3 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Grafikler Hazırlanıyor</h3>
        <p className="text-slate-400 max-w-md mx-auto">Recharts entegrasyonu ve gelişmiş veri görselleştirmeleri yakında eklenecek.</p>
      </div>
    </div>
  );
}
