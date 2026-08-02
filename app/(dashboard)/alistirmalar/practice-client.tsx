'use client';

import { useState } from 'react';
import { Code2, Play, CheckCircle2, Zap, Star, Filter, ArrowLeft, RefreshCw } from 'lucide-react';
import { CodeEditor } from '@/components/editor/code-editor';
import { motion, AnimatePresence } from 'framer-motion';

export interface PracticeProblem {
  id: string;
  title: string;
  category: string;
  language: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor' | string;
  xp: number;
  description: string;
  starterCode: string;
  expectedOutput: string;
}

interface PracticeClientProps {
  problems: PracticeProblem[];
  solvedIds: string[];
}

export function PracticeClient({ problems, solvedIds: initialSolvedIds }: PracticeClientProps) {
  const [selectedProblem, setSelectedProblem] = useState<PracticeProblem | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [solvedIds, setSolvedIds] = useState<string[]>(initialSolvedIds);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('Hepsi');
  const [isRunning, setIsRunning] = useState(false);

  const solvedSet = new Set(solvedIds);

  const filteredProblems = problems.filter((p) => {
    if (filterDifficulty === 'Hepsi') return true;
    return p.difficulty === filterDifficulty;
  });

  const handleOpenProblem = (p: PracticeProblem) => {
    setSelectedProblem(p);
    setCode(p.starterCode);
    setOutput('');
    setError('');
  };

  const handleRunAndTest = () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setOutput('');
    setError('');

    const lines: string[] = [];
    const capture = (...args: any[]) =>
      lines.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));

    const originalLog = console.log;
    console.log = capture;

    let errMessage = '';
    try {
      if (selectedProblem.language === 'python') {
        // Simple JS fallback evaluation for Python syntax demo in practice tab
        const evalCode = code.replace(/def\s+(\w+)\(([^)]*)\):/g, 'function $1($2) {')
          .replace(/return\s+/g, 'return ')
          .replace(/print\((.*)\)/g, 'console.log($1)');
        // eslint-disable-next-line no-new-func
        new Function(evalCode)();
      } else {
        // eslint-disable-next-line no-new-func
        new Function(code)();
      }
    } catch (e: any) {
      errMessage = e?.message || String(e);
    } finally {
      console.log = originalLog;
    }

    const actualOutput = lines.join('\n').trim();
    setOutput(actualOutput);
    setError(errMessage);

    const expected = selectedProblem.expectedOutput.trim();
    if (!errMessage && actualOutput === expected) {
      if (!solvedSet.has(selectedProblem.id)) {
        setSolvedIds((prev) => [...prev, selectedProblem.id]);
      }
    }

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {!selectedProblem ? (
        <>
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {['Hepsi', 'Kolay', 'Orta', 'Zor'].map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterDifficulty === diff
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Grid of Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProblems.map((p) => {
              const isSolved = solvedSet.has(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenProblem(p)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-blue-500/40 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between group backdrop-blur-md shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                        {p.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          p.difficulty === 'Kolay'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : p.difficulty === 'Orta'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                      {p.title}
                      {isSolved && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" /> +{p.xp} XP
                    </div>
                    <span className="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {isSolved ? 'Tekrar Çöz' : 'Çözmeye Başla'} →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Problem Solving View */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedProblem(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Alıştırmalara Dön
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                {selectedProblem.language}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold">
                +{selectedProblem.xp} XP
              </span>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {selectedProblem.title}
              {solvedSet.has(selectedProblem.id) && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Çözüldü
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{selectedProblem.description}</p>
            <div className="pt-2 text-xs text-slate-400">
              <strong>Beklenen Çıktı:</strong> <code className="text-yellow-400 bg-slate-900 px-2 py-1 rounded font-mono">{selectedProblem.expectedOutput}</code>
            </div>
          </div>

          {/* Editor & Output split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col h-[380px]">
              <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>main.{selectedProblem.language === 'python' ? 'py' : 'js'}</span>
                <button
                  onClick={() => setCode(selectedProblem.starterCode)}
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" /> Sıfırla
                </button>
              </div>
              <div className="flex-1">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={selectedProblem.language}
                  theme="vs-dark"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex flex-col justify-between h-[380px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Konsol Çıktısı</span>
                  <span className="text-xs text-slate-500">Test Sonucu</span>
                </div>

                {error ? (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
                    Hata: {error}
                  </div>
                ) : output ? (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                      {output}
                    </div>
                    {output.trim() === selectedProblem.expectedOutput.trim() ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Tebrikler! Test Başarıyla Geçti (+{selectedProblem.xp} XP Kazanıldı!) 🎉
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
                        ⚠️ Çıktı eşleşmedi. Beklenen: <strong className="underline">{selectedProblem.expectedOutput}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Kodu çalıştırdığınızda konsol çıktısı ve test sonucu burada görünecektir.</p>
                )}
              </div>

              <button
                onClick={handleRunAndTest}
                disabled={isRunning}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
              >
                <Play className="w-4 h-4 fill-current" /> Kodu Çalıştır &amp; Test Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
