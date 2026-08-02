'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { completeLessonAction } from '@/lib/actions/courses';
import { addLessonComment } from '@/lib/actions/comments';
import { CodeEditor } from '@/components/editor/code-editor';
import { SpeechNarrator } from '@/components/effects/speech-narrator';
import { playCelebrationSound } from '@/components/effects/confetti-sound';
import {
  BookOpen, ChevronLeft, Play, CheckCircle2, Trophy, Zap, MessageSquare, Send, Sparkles, AlertCircle, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonClientProps {
  user: any;
  course: any;
  lesson: any;
  isCompleted: boolean;
}

export function LessonClient({ user, course, lesson, isCompleted: initialCompleted }: LessonClientProps) {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [code, setCode] = useState(lesson.steps?.[0]?.code || lesson.codeChallenge?.starterCode || 'print("CodeTR ile Hoş Geldiniz!")\n');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comments state
  const [comments, setComments] = useState(lesson.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const steps = lesson.steps || [];
  const currentStep = steps[currentStepIdx] || { title: lesson.title, content: lesson.description || 'Ders içeriği hazırlanıyor...' };

  // Code Runner
  const handleRunCode = () => {
    setOutput('');
    setError('');

    const lines: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) =>
      lines.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));

    let errMessage = '';
    try {
      // Basic evaluator for Python-style print & JS syntax
      const evalCode = code
        .replace(/print\((.*)\)/g, 'console.log($1)');
      // eslint-disable-next-line no-new-func
      new Function(evalCode)();
    } catch (e: any) {
      errMessage = e?.message || String(e);
    } finally {
      console.log = originalLog;
    }

    setOutput(lines.join('\n').trim());
    setError(errMessage);
  };

  // Complete Lesson Action
  const handleCompleteLesson = async () => {
    setIsSubmitting(true);
    try {
      const res = await completeLessonAction(lesson.id);
      if (res?.success) {
        setIsCompleted(true);
        playCelebrationSound();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Comment Action
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await addLessonComment(lesson.id, commentText);
      if (res.success && res.comment) {
        setComments((prev: any[]) => [res.comment, ...prev]);
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Link href={`/kurslar/${course.slug}`} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold">
          <ChevronLeft className="w-4 h-4" /> {course.title} Derslerine Dön
        </Link>

        <div className="flex items-center gap-3">
          <SpeechNarrator text={currentStep.content} />
          <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-bold text-xs border border-yellow-500/20">
            +{lesson.xpReward} XP
          </span>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Lesson Steps & Comments) - 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Lesson Content Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-2xl">
            <h1 className="text-xl font-bold text-white leading-snug">{lesson.title}</h1>
            <p className="text-xs text-purple-400 font-mono font-bold">Bölüm: {lesson.chapter?.title}</p>

            {/* Step Content */}
            <div className="text-xs text-slate-300 leading-relaxed space-y-3 font-sans border-t border-white/5 pt-4">
              <h2 className="text-sm font-bold text-white">{currentStep.title}</h2>
              <div className="whitespace-pre-line">{currentStep.content}</div>
            </div>

            {/* Step Pagination */}
            {steps.length > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <button
                  onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIdx === 0}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40"
                >
                  Önceki Adım
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStepIdx + 1} / {steps.length}
                </span>
                <button
                  onClick={() => setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1))}
                  disabled={currentStepIdx === steps.length - 1}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white disabled:opacity-40"
                >
                  Sonraki Adım
                </button>
              </div>
            )}

            {/* Complete Button */}
            <div className="pt-2">
              <button
                onClick={handleCompleteLesson}
                disabled={isCompleted || isSubmitting}
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:opacity-90 shadow-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? '✓ Dersi Tamamladınız' : 'Dersi Tamamla & XP Kazan'}</span>
              </button>
            </div>
          </div>

          {/* Community Discussions / Comments Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" /> Ders Tartışmaları ({comments.length})
            </h3>

            {/* Comment Post Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Bu dersle ilgili soru sor veya yorum yaz..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isPostingComment || !commentText.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                Gönder
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2 max-h-60 overflow-y-auto">
              {comments.map((c: any) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-purple-300">{c.user?.name || c.user?.username}</span>
                    <span className="text-slate-500">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Code Editor & Output Console) - 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-2xl">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span className="font-mono font-bold text-slate-200">Interaktif Kod Editörü</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {course.language || 'Python'}
              </span>
            </div>

            {/* Monaco Editor */}
            <div className="h-[360px] rounded-xl overflow-hidden border border-slate-800">
              <CodeEditor value={code} onChange={setCode} language="python" theme="vs-dark" />
            </div>

            {/* Console Output */}
            {error ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                Hata: {error}
              </div>
            ) : output ? (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono">
                Çıktı:\n{output}
              </div>
            ) : null}

            {/* Run Button */}
            <button
              onClick={handleRunCode}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all text-xs shadow-lg shadow-blue-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Kodu Çalıştır</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
