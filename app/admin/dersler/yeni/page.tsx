"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, GripVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewLessonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("temel"); // temel, adimlar, sinav, ipucu

  // Mock data for UI
  const courses = [{ id: "1", title: "Python 101" }];
  const chapters = [{ id: "1", title: "Temeller" }];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    chapterId: "",
    type: "LESSON",
    order: 1,
    xpReward: 10,
    coinReward: 5,
    estimatedTime: 5,
    isPublished: false,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dersler" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Yeni Ders/İçerik</h1>
            <p className="text-slate-400 mt-1 text-sm">Zengin içerikli eğitim materyalleri oluşturun.</p>
          </div>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 font-medium"
        >
          <Save className="w-5 h-5" />
          Kaydet
        </button>
      </div>

      <div className="flex border-b border-slate-800">
        {[
          { id: "temel", label: "Temel Bilgiler" },
          { id: "adimlar", label: "İçerik Adımları" },
          { id: "sinav", label: "Sınav/Görev" },
          { id: "ipucu", label: "İpuçları" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id 
                ? "border-blue-500 text-blue-400 bg-blue-500/5" 
                : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
        {activeTab === "temel" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Ders Başlığı</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200" 
                  placeholder="Değişkenler ve Veri Tipleri"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">İçerik Tipi</label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200">
                  <option value="LESSON">Ders (Teori & Pratik)</option>
                  <option value="QUIZ">Sınav (Quiz)</option>
                  <option value="CHALLENGE">Görev (Challenge)</option>
                  <option value="PROJECT">Proje</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Bağlı Olduğu Kurs</label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200">
                  <option value="">Seçiniz...</option>
                  <option value="1">Python 101</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Bölüm (Chapter)</label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200">
                  <option value="">Seçiniz...</option>
                  <option value="1">Temeller</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-slate-800 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Sıra</label>
                <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">XP Ödülü</label>
                <input type="number" defaultValue="10" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Coin Ödülü</label>
                <input type="number" defaultValue="5" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tahmini Süre (dk)</label>
                <input type="number" defaultValue="5" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200" />
              </div>
            </div>
            
            <div className="space-y-2 border-t border-slate-800 pt-6">
              <label className="text-sm font-medium text-slate-300">Kısa Açıklama (Opsiyonel)</label>
              <textarea 
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 resize-none" 
              />
            </div>
          </div>
        )}

        {activeTab === "adimlar" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">İçerik Adımları</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm">
                <Plus className="w-4 h-4" />
                Adım Ekle
              </button>
            </div>
            
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500">Henüz adım eklenmedi. Kullanıcıların kaydırarak geçeceği bilgi kartları ekleyin.</p>
            </div>
          </div>
        )}

        {activeTab === "sinav" && (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
             <p className="text-slate-500">Soru eklemek için burayı kullanın.</p>
          </div>
        )}

        {activeTab === "ipucu" && (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
             <p className="text-slate-500">Görev için ipuçları ekleyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
