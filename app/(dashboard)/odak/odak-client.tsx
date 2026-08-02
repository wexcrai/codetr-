'use client';

import { useState, useEffect } from 'react';
import { Timer, Play, Pause, RefreshCw, CheckCircle2, Flame } from 'lucide-react';
import { playCelebrationSound } from '@/components/effects/confetti-sound';

export function OdakClient() {
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      playCelebrationSound();
      if (mode === 'FOCUS') {
        setCompletedSessions((prev) => prev + 1);
        setMode('BREAK');
        setTimeLeft(5 * 60);
      } else {
        setMode('FOCUS');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-slate-900 to-slate-950 text-center space-y-8 shadow-2xl backdrop-blur-md">
      {/* Mode Switcher */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            setMode('FOCUS');
            setTimeLeft(25 * 60);
            setIsRunning(false);
          }}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'FOCUS' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-white/5 border border-white/10 text-slate-400'
          }`}
        >
          🧠 Odaklanma (25 Dk)
        </button>
        <button
          onClick={() => {
            setMode('BREAK');
            setTimeLeft(5 * 60);
            setIsRunning(false);
          }}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'BREAK' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border border-white/10 text-slate-400'
          }`}
        >
          ☕ Kısa Mola (5 Dk)
        </button>
      </div>

      {/* Clock Display */}
      <div className="space-y-2">
        <span className="font-mono text-7xl sm:text-8xl font-extrabold text-white tracking-widest block">
          {formatTime(timeLeft)}
        </span>
        <p className="text-xs text-slate-400 font-medium">
          {mode === 'FOCUS' ? '🎯 Kodlama zamanı! Dikkatinizi toplamaya odaklanın.' : '☕ Mola zamanı! Biraz dinlenin ve su için.'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-cyan-500/20"
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isRunning ? 'Duraklat' : 'Başlat'}</span>
        </button>

        <button
          onClick={handleReset}
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Sıfırla"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Completed Sessions Stats */}
      <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
        <Flame className="w-4 h-4 text-orange-400 streak-fire" />
        <span>Bugün Tamamlanan Oturumlar: <strong className="text-yellow-400 font-mono text-sm">{completedSessions}</strong></span>
      </div>
    </div>
  );
}
