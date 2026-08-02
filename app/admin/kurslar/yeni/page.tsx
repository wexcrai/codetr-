"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDesc: "",
    language: "python",
    level: "BEGINNER",
    icon: "🐍",
    color: "#3B82F6",
    isPublished: false,
    order: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push("/admin/kurslar");
        router.refresh();
      } else {
        alert("Hata oluştu.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kurslar" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Yeni Kurs Ekle</h1>
          <p className="text-slate-400 mt-1 text-sm">Platforma yeni bir eğitim müfredatı ekleyin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Kurs Adı</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
              placeholder="Örn: Python'a Giriş"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Kısa Açıklama (Kart için)</label>
            <input 
              required
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
              placeholder="Örn: Temel Python programlama kavramları"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Detaylı Açıklama</label>
          <textarea 
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none" 
            placeholder="Kursun detaylı içeriği..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Dil / Kategori</label>
            <select 
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="web">Web Geliştirme</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Zorluk Seviyesi</label>
            <select 
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="BEGINNER">Başlangıç (Beginner)</option>
              <option value="INTERMEDIATE">Orta (Intermediate)</option>
              <option value="ADVANCED">İleri (Advanced)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Sıra No</label>
            <input 
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-slate-800">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">İkon (Emoji)</label>
            <input 
              required
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 text-2xl text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tema Rengi</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-16 h-12 rounded bg-transparent border-0 cursor-pointer" 
              />
              <span className="text-slate-400 font-mono">{formData.color}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="sr-only" 
              />
              <div className={cn("block w-12 h-7 rounded-full transition-colors", formData.isPublished ? "bg-blue-600" : "bg-slate-700")}></div>
              <div className={cn("absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform", formData.isPublished && "transform translate-x-5")}></div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">Yayında</div>
              <div className="text-xs text-slate-500">Kullanıcılar bu kursu görebilir</div>
            </div>
          </label>

          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 font-medium disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Kaydediliyor..." : "Kursu Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
