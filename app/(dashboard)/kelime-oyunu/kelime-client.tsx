'use client';

import { useState } from 'react';
import { Trophy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { playCelebrationSound } from '@/components/effects/confetti-sound';

const TARGET_WORD = "CLASS"; // 5-letter target

export function KelimeClient() {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const handleKeyPress = (char: string) => {
    if (isGameOver) return;

    if (char === 'ENTER') {
      if (currentGuess.length !== 5) return;

      const nextGuesses = [...guesses, currentGuess.toUpperCase()];
      setGuesses(nextGuesses);

      if (currentGuess.toUpperCase() === TARGET_WORD) {
        setIsWon(true);
        setIsGameOver(true);
        playCelebrationSound();
      } else if (nextGuesses.length >= 6) {
        setIsGameOver(true);
      }

      setCurrentGuess('');
    } else if (char === 'DEL') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/i.test(char)) {
      setCurrentGuess((prev) => (prev + char).toUpperCase());
    }
  };

  const getLetterColor = (word: string, index: number) => {
    const char = word[index];
    if (TARGET_WORD[index] === char) return 'bg-emerald-600 border-emerald-500 text-white';
    if (TARGET_WORD.includes(char)) return 'bg-yellow-600 border-yellow-500 text-white';
    return 'bg-slate-800 border-slate-700 text-slate-400';
  };

  return (
    <div className="p-8 rounded-3xl border border-purple-500/30 bg-slate-950 text-center space-y-6 shadow-2xl backdrop-blur-md">
      {/* Wordle Grid 6 Rows x 5 Cols */}
      <div className="grid grid-rows-6 gap-2 max-w-[280px] mx-auto">
        {Array.from({ length: 6 }).map((_, rowIdx) => {
          const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess.padEnd(5, ' ') : '     ');

          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, colIdx) => {
                const char = guess[colIdx] || '';
                const isSubmitted = rowIdx < guesses.length;
                const colorClass = isSubmitted ? getLetterColor(guesses[rowIdx], colIdx) : 'bg-slate-900 border-slate-800 text-white';

                return (
                  <div
                    key={colIdx}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-extrabold text-lg transition-all ${colorClass}`}
                  >
                    {char.trim()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Result Status */}
      {isWon && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold space-y-1">
          <p className="text-sm">🎉 TEBRİKLER! GÜNÜN TERİMİNİ BULDUNUZ!</p>
          <p className="text-yellow-400">+50 XP Kazanıldı!</p>
        </div>
      )}

      {isGameOver && !isWon && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold">
          Doğru Terim: <span className="font-mono text-yellow-400 text-sm">{TARGET_WORD}</span> • Yarın Tekrar Dene!
        </div>
      )}

      {/* Onscreen Keyboard */}
      <div className="max-w-md mx-auto space-y-2 pt-2">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {rIdx === 2 && (
              <button
                onClick={() => handleKeyPress('ENTER')}
                className="px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold"
              >
                GİRİŞ
              </button>
            )}

            {row.split('').map((char) => (
              <button
                key={char}
                onClick={() => handleKeyPress(char)}
                className="w-8 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs"
              >
                {char}
              </button>
            ))}

            {rIdx === 2 && (
              <button
                onClick={() => handleKeyPress('DEL')}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                SİL
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
