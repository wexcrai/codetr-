import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PracticeClient } from "./practice-client";
import { Code2, Trophy, Zap, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Alıştırmalar & Kodlama Pratiği | CodeTR",
  description: "Algoritma soruları çöz, pratik yap ve XP kazan.",
};

export const PRACTICE_PROBLEMS = [
  {
    id: "p-1",
    title: "İki Sayının Toplamı (Sum of Two)",
    category: "Temel Algoritma",
    language: "python",
    difficulty: "Kolay",
    xp: 40,
    description: "Verilen iki sayıyı toplayan bir fonksiyon yazın.",
    starterCode: "def topla(a, b):\n    # Kodunu buraya yaz\n    return a + b\n\nprint(topla(5, 7))\n",
    expectedOutput: "12",
  },
  {
    id: "p-2",
    title: "Metni Tersine Çevirme (Reverse String)",
    category: "String İşlemleri",
    language: "python",
    difficulty: "Kolay",
    xp: 50,
    description: "Verilen bir metni tersten yazdıran fonksiyonu tamamlayın.",
    starterCode: "def metni_ters_cevahir(metin):\n    return metin[::-1]\n\nprint(metni_ters_cevahir('CodeTR'))\n",
    expectedOutput: "RTedoC",
  },
  {
    id: "p-3",
    title: "Dizi Elemanları Toplamı (Array Sum)",
    category: "Diziler & Listeler",
    language: "javascript",
    difficulty: "Kolay",
    xp: 45,
    description: "Bir dizideki tüm sayıların toplamını hesaplayan JS fonksiyonu yazın.",
    starterCode: "function diziToplami(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}\n\nconsole.log(diziToplami([10, 20, 30, 40]));\n",
    expectedOutput: "100",
  },
  {
    id: "p-4",
    title: "Faktöriyel Hesaplama (Factorial)",
    category: "Matematik & Rekürsiyon",
    language: "python",
    difficulty: "Orta",
    xp: 75,
    description: "Verilen n sayısının faktöriyelini (n!) hesaplayan fonksiyonu yazın.",
    starterCode: "def faktoriyel(n):\n    if n <= 1:\n        return 1\n    return n * faktoriyel(n - 1)\n\nprint(faktoriyel(5))\n",
    expectedOutput: "120",
  },
  {
    id: "p-5",
    title: "Palindrom Kelime Kontrolü",
    category: "String & Mantık",
    language: "javascript",
    difficulty: "Orta",
    xp: 80,
    description: "Kelimenin tersten okunuşu ile düz okunuşunun eşit olup olmadığını kontrol edin.",
    starterCode: "function isPalindrome(str) {\n  const reversed = str.split('').reverse().join('');\n  return str === reversed;\n}\n\nconsole.log(isPalindrome('kayak'));\n",
    expectedOutput: "true",
  },
  {
    id: "p-6",
    title: "Asal Sayı Kontrolü (Prime Number)",
    category: "Matematik & Döngüler",
    language: "python",
    difficulty: "Zor",
    xp: 120,
    description: "Verilen bir n sayısının asal sayı olup olmadığını tespit edin.",
    starterCode: "def asal_mi(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nprint(asal_mi(17))\n",
    expectedOutput: "True",
  },
];

export default async function PracticePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const [completedSubmissions, user] = await Promise.all([
    db.codeSubmission.findMany({
      where: { userId, passed: true },
      select: { challengeId: true },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { xp: true, coins: true },
    }),
  ]);

  const solvedIds = new Set(completedSubmissions.map((s) => s.challengeId));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3">
            <Code2 className="w-3.5 h-3.5" /> İnteraktif Kodlama Alıştırmaları
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pratik &amp; <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">Alıştırmalar</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Algoritma sorularını çöz, kodlama pratikleri ile yeteneklerini geliştir ve XP topla!
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-3 shadow-xl">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Çözülen Problemler</p>
              <p className="text-xl font-bold text-white">{solvedIds.size} / {PRACTICE_PROBLEMS.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Client Component */}
      <PracticeClient problems={PRACTICE_PROBLEMS} solvedIds={Array.from(solvedIds)} />
    </div>
  );
}
