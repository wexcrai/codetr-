import React from "react";
import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background/80 backdrop-blur-lg border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4 inline-flex">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                CodeTR
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Türkiye'nin en yenilikçi kodlama eğitim platformu. İnteraktif dersler, projeler ve yarışmalarla yazılım öğrenin.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-blue-400 transition-colors">Kurslar</Link></li>
              <li><Link href="/exercises" className="hover:text-blue-400 transition-colors">Alıştırmalar</Link></li>
              <li><Link href="/leaderboard" className="hover:text-blue-400 transition-colors">Liderlik Tablosu</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">Hakkımızda</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Yasal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Kullanım Şartları</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">İletişim</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} CodeTR. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
              Github <ExternalLink className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#1DA1F2] transition-colors flex items-center gap-1">
              Twitter <ExternalLink className="w-4 h-4" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#5865F2] transition-colors flex items-center gap-1">
              Discord <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
