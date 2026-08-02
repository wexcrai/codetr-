'use client';

import { useState } from 'react';
import { sendFriendRequest, respondFriendRequest } from '@/lib/actions/friendship';
import { UserPlus, Copy, Check, ShieldCheck, UserCheck, UserX, Flame, Star, Sparkles, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendshipManagerProps {
  userTag: string;
  friends: any[];
  pendingRequests: any[];
}

export function FriendshipManager({ userTag, friends: initialFriends, pendingRequests: initialPending }: FriendshipManagerProps) {
  const [copied, setCopied] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [friends, setFriends] = useState(initialFriends);
  const [pendingRequests, setPendingRequests] = useState(initialPending);
  const [isSending, setIsSending] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(userTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) return;

    setIsSending(true);
    setFeedback(null);

    try {
      const res = await sendFriendRequest(targetInput);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message! });
        setTargetInput('');
      } else if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'İstek gönderilirken hata oluştu.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    setActionLoadingId(requestId);
    setFeedback(null);

    try {
      const res = await respondFriendRequest(requestId, accept);
      if (res.success) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        setFeedback({ type: 'success', text: res.message! });
      } else if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'İşlem başarısız.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: User Tag & Add Friend Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Tag Copy Card */}
        <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-950/20 backdrop-blur-md flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Özel CodeTR Kimliğiniz (ID / Tag)
            </span>
            <p className="text-xs text-slate-400 mt-1">Arkadaşlarınızın size istek göndermesi için bu kodunuzu paylaşın.</p>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
            <span className="font-mono text-xl font-extrabold text-white tracking-widest">{userTag}</span>
            <button
              onClick={handleCopyTag}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* Add Friend Form */}
        <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-purple-400" /> Kimlik / Kullanıcı Adı ile Arkadaş Ekle
            </span>
            <p className="text-xs text-slate-400 mt-1">Arkadaşınızın CodeTR Tag'ını (Örn: CTR-8492) veya e-postasını girin.</p>
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Örn: CTR-8492 veya @kullanici"
              className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={isSending || !targetInput.trim()}
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shrink-0 shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>İstek Gönder</span>
            </button>
          </form>
        </div>
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="underline text-slate-400 hover:text-white">Kapat</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Gelen Arkadaşlık İstekleri ({pendingRequests.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                    {req.sender.image ? <img src={req.sender.image} alt="" className="w-full h-full object-cover" /> : req.sender.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">{req.sender.name || req.sender.username}</p>
                    <p className="text-[10px] font-mono text-amber-400">{req.sender.userTag}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRespond(req.id, true)}
                    disabled={actionLoadingId === req.id}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
                    title="Kabul Et"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, false)}
                    disabled={actionLoadingId === req.id}
                    className="p-2 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white font-bold text-xs transition-colors"
                    title="Reddet"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-400" /> Arkadaşlarım ({friends.length})
        </h3>

        {friends.length === 0 ? (
          <div className="p-10 rounded-2xl border border-white/10 bg-white/5 text-center space-y-2">
            <p className="text-sm font-semibold text-white">Henüz arkadaş eklemediniz.</p>
            <p className="text-xs text-slate-400">Yukarıdaki arama kutusuna bir CodeTR Tag'ı girerek ilk arkadaşınızı ekleyin!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div key={friend.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-3 shadow-xl hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white overflow-hidden shrink-0">
                    {friend.image ? <img src={friend.image} alt="" className="w-full h-full object-cover" /> : friend.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{friend.name || friend.username}</p>
                    <p className="text-xs font-mono text-blue-400">{friend.userTag}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 font-semibold">
                  <span className="text-blue-400">Seviye {friend.level}</span>
                  <span className="text-yellow-400">{friend.xp} XP</span>
                  {friend.currentStreak > 0 && (
                    <span className="text-orange-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 streak-fire" /> {friend.currentStreak}d
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
