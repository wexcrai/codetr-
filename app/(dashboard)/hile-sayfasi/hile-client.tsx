'use client';

import { useState } from 'react';
import { Copy, Check, Search, FileCode, Zap } from 'lucide-react';

const CHEATSHEET_DATA = [
  {
    category: "Python",
    icon: "🐍",
    snippets: [
      { title: "Liste Üreteci (List Comprehension)", code: "kareler = [x**2 for x in range(10) if x % 2 == 0]" },
      { title: "Sözlük Üreteci (Dict Comprehension)", code: "kare_sozluk = {x: x**2 for x in range(5)}" },
      { title: "Dosya Okuma (With Context)", code: "with open('dosya.txt', 'r', encoding='utf-8') as f:\n    icerik = f.read()" },
      { title: "Lambda Fonksiyonu", code: "topla = lambda a, b: a + b\nprint(topla(5, 10))" },
    ],
  },
  {
    category: "JavaScript",
    icon: "⚡",
    snippets: [
      { title: "Array Map & Filter", code: "const ciftler = sayilar.filter(x => x % 2 === 0).map(x => x * 2);" },
      { title: "Async / Await Fetch", code: "async function veriCek() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n}" },
      { title: "Destructuring (Nesne Parçalama)", code: "const { name, age } = kullanici;\nconst [ilk, ikinci] = liste;" },
      { title: "Promise.all Canlı Çağrı", code: "const [u1, u2] = await Promise.all([fetch(url1), fetch(url2)]);" },
    ],
  },
  {
    category: "SQL",
    icon: "🗄️",
    snippets: [
      { title: "SELECT GROUP BY & HAVING", code: "SELECT kategori, COUNT(*) FROM urunler\nGROUP BY kategori\nHAVING COUNT(*) > 5;" },
      { title: "INNER JOIN İki Tablo", code: "SELECT u.name, s.toplam FROM users u\nJOIN siparisler s ON u.id = s.user_id;" },
      { title: "CREATE TABLE Kısıtlamaları", code: "CREATE TABLE kullanicilar (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL\n);" },
    ],
  },
  {
    category: "Git",
    icon: "🌱",
    snippets: [
      { title: "Yeni Dal Oluştur & Geç", code: "git checkout -b ozellik-dali" },
      { title: "Commit & Push", code: "git add .\ngit commit -m 'Yeni ozellik eklendi'\ngit push origin main" },
      { title: "Son Commit Geri Al", code: "git reset --soft HEAD~1" },
    ],
  },
];

export function HileClient() {
  const [activeCategory, setActiveCategory] = useState("Python");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeGroup = CHEATSHEET_DATA.find((g) => g.category === activeCategory);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {CHEATSHEET_DATA.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setActiveCategory(cat.category)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeCategory === cat.category
                ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.category}</span>
          </button>
        ))}
      </div>

      {/* Snippets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeGroup?.snippets.map((snip, idx) => (
          <div key={snip.title} className="p-5 rounded-2xl border border-white/10 bg-slate-950 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">{snip.title}</h3>
              <button
                onClick={() => handleCopy(snip.code, idx)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Kodu Kopyala"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto">
              <code>{snip.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
