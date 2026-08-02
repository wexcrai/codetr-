'use client';

import { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export function playCelebrationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch (e) {
    // Audio Context not allowed before user gesture
  }
}

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  const toggleSound = () => {
    setMuted(!muted);
    if (muted) {
      playCelebrationSound();
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
      title={muted ? 'Ses Efektleri Kapalı' : 'Ses Efektleri Açık'}
    >
      {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
      <span className="hidden sm:inline">{muted ? 'Ses Kapalı' : 'Ses Açık'}</span>
    </button>
  );
}
