import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProjelerClient } from "./projeler-client";
import { FolderGit2, Plus, Sparkles, Star, Code2, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Proje Stüdyosu & Portfolyo | CodeTR",
  description: "Geliştirdiğin projeleri sergile, topluluğun projelerini incele.",
};

export const SAMPLE_PROJECTS = [
  {
    id: "proj-1",
    title: "🐍 Python Otomatik Veri Kazıyıcı (Scraper)",
    category: "Python & Veri",
    author: "Ahmet_Dev",
    userTag: "CTR-8492",
    description: "Web sitelerinden otomatik fiyat takibi yapan ve Discord webhook ile bildirim gönderen Python aracı.",
    stars: 14,
    language: "Python",
    githubUrl: "https://github.com",
  },
  {
    id: "proj-2",
    title: "⚡ Modern Koyu Tema Dashboard UI",
    category: "Frontend & CSS",
    author: "Zeynep_Code",
    userTag: "CTR-3921",
    description: "React ve Tailwind CSS ile geliştirilmiş glassmorphism efektli dinamik yönetim paneli.",
    stars: 28,
    language: "JavaScript",
    githubUrl: "https://github.com",
  },
  {
    id: "proj-3",
    title: "🗄️ SQL Müşteri Takip Sistemi",
    category: "SQL & Veritabanı",
    author: "Mehmet_Py",
    userTag: "CTR-1092",
    description: "PostgreSQL sorguları ile müşteri siparişlerini ve stok durumunu raporlayan SQL betikleri.",
    stars: 9,
    language: "SQL",
    githubUrl: "https://github.com",
  },
];

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold shadow-lg">
          <FolderGit2 className="w-4 h-4 text-purple-400" /> Proje Stüdyosu &amp; Portfolyo
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Öğrenci <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Projeleri Vitrini</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Geliştirdiğiniz açık kaynak projeleri toplulukla paylaşın, başkalarının projelerini yıldızlayın!
        </p>
      </div>

      <ProjelerClient initialProjects={SAMPLE_PROJECTS} />
    </div>
  );
}
