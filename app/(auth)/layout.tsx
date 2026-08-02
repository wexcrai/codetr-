import React from "react";
import Link from "next/link";
import { Terminal, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-blue-500/30">
      {/* Left side - Branding & Info (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-900 border-r border-white/10 relative overflow-hidden p-12 justify-between">
        <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-600/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Terminal className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              CodeTR
            </span>
          </Link>

          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Kodlama Kariyerinize <br />
            <span className="text-blue-400">İlk Adımı Atın</span>
          </h1>
          
          <p className="text-slate-400 text-lg mb-10 max-w-md">
            Binlerce öğrenci arasına katılın, interaktif dersler ve gerçek dünya projeleriyle kodlamayı öğrenin.
          </p>

          <div className="space-y-4">
            {[
              "12+ Programlama Dili ve Teknolojisi",
              "Oyunlaştırılmış, Eğlenceli Öğrenme",
              "Tarayıcı Üzerinden Anında Pratik",
              "Doğrulanmış Başarı Sertifikaları"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 glass-card p-6 rounded-xl border border-white/10 mt-12 max-w-lg">
          <p className="text-slate-300 italic mb-4">
            "CodeTR ile sıfırdan başladım, şimdi bir yazılım şirketinde Frontend Developer olarak çalışıyorum. Harika bir platform!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              OA
            </div>
            <div>
              <div className="font-bold text-white text-sm">Onur A.</div>
              <div className="text-xs text-slate-400">Frontend Developer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        <div className="absolute inset-0 z-0 overflow-hidden lg:hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-600/10 blur-[100px]" />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Terminal className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                CodeTR
              </span>
            </Link>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
