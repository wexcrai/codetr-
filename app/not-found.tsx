import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <div className="text-[140px] font-black leading-none gradient-text opacity-20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-24 w-24 text-blue-400/60" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Sayfa Bulunamadı
          </h1>
          <p className="text-muted-foreground">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            Ana sayfaya dönün veya farklı bir şey deneyin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </Link>
          <Link
            href="/kurslar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold transition-all hover:bg-muted hover:-translate-y-0.5"
          >
            <BookOpen className="h-4 w-4" />
            Kurslar
          </Link>
        </div>
      </div>
    </div>
  );
}
