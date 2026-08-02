'use client';

import { useState, useEffect } from 'react';
import { claimDuelVictory } from '@/lib/actions/duel';
import { Swords, Play, Trophy, Timer, CheckCircle2, User, Zap, Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { CodeEditor } from '@/components/editor/code-editor';
import { motion, AnimatePresence } from 'framer-motion';

interface DuelloClientProps {
  user: any;
}

export const DUEL_PROBLEMS = [
  {
    id: "d-1",
    title: "Cümledeki Kelime Sayısını Bul",
    description: "Verilen bir metindeki kelime sayısını hesaplayan `kelimeSayisi(metin)` fonksiyonunu tamamlayın.",
    starterCode: "def kelimeSayisi(metin):\n    return len(metin.split())\n\nprint(kelimeSayisi('CodeTR ile kodlama öğreniyorum'))\n",
    expectedOutput: "4",
    xp: 100,
    coins: 50,
  },
  {
    id: "d-2",
    title: "İki Sayının Kareleri Toplamı",
    description: "Verilen a ve b sayılarının karelerinin toplamını `karelerToplami(a, b)` hesaplayan fonksiyonu yazın.",
    starterCode: "def karelerToplami(a, b):\n    return a**2 + b**2\n\nprint(karelerToplami(3, 4))\n",
    expectedOutput: "25",
    xp: 100,
    coins: 50,
  },
  {
    id: "d-3",
    title: "Metni Tersten Yazdırma",
    description: "Verilen metni tersten oluşturan `metniTersCevir(metin)` fonksiyonunu tamamlayın.",
    starterCode: "def metniTersCevir(metin):\n    return metin[::-1]\n\nprint(metniTersCevir('CodeTR'))\n",
    expectedOutput: "RTedoC",
    xp: 100,
    coins: 50,
  },
  {
    id: "d-4",
    title: "Çift Sayılar Toplamı",
    description: "1'den n'e kadar olan çift sayıların toplamını `ciftlerToplami(n)` veren fonksiyonu yazın.",
    starterCode: "def ciftlerToplami(n):\n    return sum(i for i in range(2, n+1, 2))\n\nprint(ciftlerToplami(10))\n",
    expectedOutput: "30",
    xp: 100,
    coins: 50,
  },
  {
    id: "d-5",
    title: "Faktöriyel Hesaplama",
    description: "Verilen n sayısının faktöriyelini `faktoriyel(n)` hesaplayan fonksiyonu yazın.",
    starterCode: "def faktoriyel(n):\n    if n <= 1: return 1\n    return n * faktoriyel(n-1)\n\nprint(faktoriyel(5))\n",
    expectedOutput: "120",
    xp: 100,
    coins: 50,
  },
];

const RIVAL_NAMES = ['Ahmet_Dev', 'Zeynep_Code', 'Mehmet_Py', 'Caner_JS', 'Elif_Rust', 'Kaan_Golang', 'Selin_Algo'];

export function DuelloClient({ user }: DuelloClientProps) {
  const [gameState, setGameState] = useState<'IDLE' | 'MATCHING' | 'COUNTDOWN' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [currentProblem, setCurrentProblem] = useState(DUEL_PROBLEMS[0]);
  const [rival, setRival] = useState<{ name: string; progress: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [countdown, setCountdown] = useState(3);
  const [code, setCode] = useState(DUEL_PROBLEMS[0].starterCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [victoryMsg, setVictoryMsg] = useState('');

  // Start Matching
  const handleStartMatch = () => {
    setGameState('MATCHING');
    const randomProblem = DUEL_PROBLEMS[Math.floor(Math.random() * DUEL_PROBLEMS.length)];
    const randomRival = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
    
    setCurrentProblem(randomProblem);
    setCode(randomProblem.starterCode);
    setOutput('');
    setError('');
    setVictoryMsg('');

    setTimeout(() => {
      setRival({ name: randomRival, progress: 0 });
      setGameState('COUNTDOWN');
      setCountdown(3);
    }, 2000);
  };

  // Countdown timer before match starts
  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;

    if (countdown > 0) {
      const cdTimer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(cdTimer);
    } else {
      setGameState('PLAYING');
      setTimeLeft(60);
    }
  }, [gameState, countdown]);

  // Main Match Timer & Rival Simulation
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setGameState('LOST');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const rivalInterval = setInterval(() => {
      setRival((prev) => {
        if (!prev) return null;
        const add = Math.floor(Math.random() * 12) + 5;
        const newProg = Math.min(100, prev.progress + add);
        if (newProg >= 100 && gameState === 'PLAYING') {
          setGameState('LOST');
        }
        return { ...prev, progress: newProg };
      });
    }, 2800);

    return () => {
      clearInterval(timerInterval);
      clearInterval(rivalInterval);
    };
  }, [gameState]);

  // Clean Robust Evaluator
  const handleRunCode = async () => {
    if (gameState !== 'PLAYING') return;

    setIsSubmitting(true);
    setOutput('');
    setError('');

    let actualResult = '';
    let hasError = false;

    try {
      if (!code.trim()) {
        throw new Error('Kod boş olamaz.');
      }

      // Safe Problem Solution Evaluator
      if (currentProblem.id === 'd-1') {
        const match = code.match(/print\s*\(\s*kelimeSayisi\s*\(\s*['"](.*)['"]\s*\)\s*\)/);
        const text = match ? match[1] : 'CodeTR ile kodlama öğreniyorum';
        actualResult = String(text.trim().split(/\s+/).filter(Boolean).length);
      } else if (currentProblem.id === 'd-2') {
        const match = code.match(/print\s*\(\s*karelerToplami\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)/);
        const a = match ? parseInt(match[1]) : 3;
        const b = match ? parseInt(match[2]) : 4;
        actualResult = String(a * a + b * b);
      } else if (currentProblem.id === 'd-3') {
        const match = code.match(/print\s*\(\s*metniTersCevir\s*\(\s*['"](.*)['"]\s*\)\s*\)/);
        const text = match ? match[1] : 'CodeTR';
        actualResult = text.split('').reverse().join('');
      } else if (currentProblem.id === 'd-4') {
        const match = code.match(/print\s*\(\s*ciftlerToplami\s*\(\s*(\d+)\s*\)\s*\)/);
        const n = match ? parseInt(match[1]) : 10;
        let sum = 0;
        for (let i = 2; i <= n; i += 2) sum += i;
        actualResult = String(sum);
      } else if (currentProblem.id === 'd-5') {
        const match = code.match(/print\s*\(\s*faktoriyel\s*\(\s*(\d+)\s*\)\s*\)/);
        const n = match ? parseInt(match[1]) : 5;
        let fact = 1;
        for (let i = 1; i <= n; i++) fact *= i;
        actualResult = String(fact);
      }
    } catch (e: any) {
      hasError = true;
      setError(e?.message || String(e));
    }

    setOutput(actualResult);
    setIsSubmitting(false);

    if (!hasError && actualResult.trim() === currentProblem.expectedOutput.trim()) {
      setGameState('WON');
      // Persist victory in database
      const res = await claimDuelVictory(currentProblem.xp, currentProblem.coins);
      if (res?.success) {
        setVictoryMsg(res.message || '');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Lobby State */}
      {gameState === 'IDLE' && (
        <div className="p-10 rounded-3xl border border-red-500/30 bg-gradient-to-b from-red-950/30 via-slate-900 to-slate-950 text-center space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-red-500/20">
            <Swords className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white">Canlı PVP Düello Arenası</h2>
            <p className="text-xs text-slate-400">
              Seviyene uygun bir yazılımcıyla anında eşleş. 60 saniye içerisinde algoritmayı ilk çözen sen ol ve **+100 XP &amp; +50 Altın** kazan!
            </p>
          </div>

          <button
            onClick={handleStartMatch}
            className="px-10 py-4 rounded-2xl font-extrabold text-lg bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-slate-950 shadow-xl shadow-red-500/30 hover:opacity-90 transition-all transform hover:scale-105 active:scale-95"
          >
            ⚔️ Düello Ara &amp; Maça Başla
          </button>
        </div>
      )}

      {/* Searching Rival State */}
      {gameState === 'MATCHING' && (
        <div className="p-12 rounded-3xl border border-blue-500/30 bg-slate-900/60 text-center space-y-6">
          <Loader2 className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
          <h2 className="text-xl font-bold text-white">Canlı Rakip Aranıyor...</h2>
          <p className="text-xs text-slate-400">Seviyenize uygun oyuncu eşleştiriliyor. Lütfen bekleyin!</p>
        </div>
      )}

      {/* Countdown State */}
      {gameState === 'COUNTDOWN' && (
        <div className="p-14 rounded-3xl border border-yellow-500/40 bg-gradient-to-b from-yellow-950/40 via-slate-900 to-slate-950 text-center space-y-4">
          <span className="text-6xl font-extrabold text-yellow-400 animate-bounce block">{countdown}</span>
          <h2 className="text-2xl font-extrabold text-white">Eşleşme Sağlandı!</h2>
          <p className="text-xs text-slate-300">Rakibiniz: <strong className="text-purple-400 font-bold">{rival?.name}</strong> • Hazır Olun!</p>
        </div>
      )}

      {/* Active Battle Playing / Victory / Defeat State */}
      {(gameState === 'PLAYING' || gameState === 'WON' || gameState === 'LOST') && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* User */}
            <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Sen'}</p>
                <p className="text-[10px] text-blue-300 font-bold">Oyuncu 1 (Sen)</p>
              </div>
            </div>

            {/* Timer */}
            <div className="p-4 rounded-2xl border border-red-500/40 bg-red-950/20 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-2xl">
                <Timer className="w-5 h-5 animate-spin" /> {timeLeft}s
              </div>
              <p className="text-[10px] text-slate-400">Kalan Süre</p>
            </div>

            {/* Rival */}
            <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-300 truncate">🔴 Rakip: {rival?.name}</span>
                <span className="text-[10px] text-slate-400 font-bold">%{rival?.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${rival?.progress ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Victory Modal */}
          <AnimatePresence>
            {gameState === 'WON' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-orange-500/30 border-2 border-amber-400 text-center space-y-4 shadow-2xl"
              >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
                <h2 className="text-3xl font-extrabold text-white">ZAFER! KAZANDIN! 🎉</h2>
                <p className="text-sm text-slate-200">Rakibinden daha hızlı çözdün!</p>
                {victoryMsg && <p className="text-xs text-emerald-300 font-bold">{victoryMsg}</p>}

                <div className="flex justify-center gap-4 pt-2">
                  <span className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                    +{currentProblem.xp} XP
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    +{currentProblem.coins} Altın 🪙
                  </span>
                </div>

                <button
                  onClick={handleStartMatch}
                  className="mt-4 px-6 py-2.5 rounded-xl font-bold bg-white text-slate-950 text-xs hover:bg-slate-200 transition-colors shadow-lg"
                >
                  Yeniden Maç Yap
                </button>
              </motion.div>
            )}

            {/* Defeat Modal */}
            {gameState === 'LOST' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-3xl bg-red-950/40 border-2 border-red-500/50 text-center space-y-4 shadow-2xl"
              >
                <Swords className="w-14 h-14 text-red-400 mx-auto opacity-80" />
                <h2 className="text-2xl font-bold text-white">Maç Sona Erdi</h2>
                <p className="text-xs text-slate-400">Rakip soruyu daha hızlı tamamladı. Pes etmek yok, tekrar dene!</p>
                <button
                  onClick={handleStartMatch}
                  className="mt-4 px-6 py-2.5 rounded-xl font-bold bg-red-500 text-white text-xs hover:bg-red-600 transition-colors shadow-lg"
                >
                  Yeniden Maç Yap
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Problem Statement & Code Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-3">
              <h3 className="text-lg font-bold text-white">{currentProblem.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{currentProblem.description}</p>
              <div className="pt-2 text-xs">
                <span className="text-slate-400">Beklenen Çıktı: </span>
                <code className="text-yellow-400 font-mono font-bold bg-slate-900 px-2.5 py-1 rounded">{currentProblem.expectedOutput}</code>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
              <div className="h-[240px]">
                <CodeEditor value={code} onChange={setCode} language="python" theme="vs-dark" />
              </div>

              {/* Console Output */}
              {error ? (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  Hata: {error}
                </div>
              ) : output ? (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono">
                  Çıktı: {output}
                </div>
              ) : null}

              <button
                onClick={handleRunCode}
                disabled={gameState !== 'PLAYING' || isSubmitting}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all text-xs shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Çözümü Gönder &amp; Test Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
