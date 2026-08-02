'use client';

import { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';

interface SpeechNarratorProps {
  text: string;
}

export function SpeechNarrator({ text }: SpeechNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const cleanText = text.replace(/<[^>]*>/g, '').replace(/```[\s\S]*?```/g, 'Kod bloğu.');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
        isPlaying
          ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
      }`}
    >
      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
      <span>{isPlaying ? 'Dersi Durdur' : 'Dersi Sesli Dinle 🔊'}</span>
    </button>
  );
}
