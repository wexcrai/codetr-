'use client';

import { useState } from 'react';
import { grantBadgeAdmin, revokeBadgeAdmin } from '@/lib/actions/badges';
import { Award, Check, Trash2, Plus, Search, Loader2, ShieldCheck, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminRozetClientProps {
  users: any[];
  badges: any[];
  userBadges: any[];
}

export function AdminRozetClient({ users, badges, userBadges: initialUserBadges }: AdminRozetClientProps) {
  const [userBadges, setUserBadges] = useState(initialUserBadges);
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(badges[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedBadge = badges.find((b) => b.id === selectedBadgeId);

  const handleGrant = async () => {
    if (!selectedUserId || !selectedBadge) return;

    setLoadingId('GRANT');
    setFeedback(null);

    try {
      const res = await grantBadgeAdmin({
        targetUserId: selectedUserId,
        badgeId: selectedBadge.id,
        badgeTitle: selectedBadge.title,
      });

      if (res.success) {
        setUserBadges((prev) => [
          ...prev.filter((ub) => !(ub.userId === selectedUserId && ub.badgeId === selectedBadge.id)),
          {
            userId: selectedUserId,
            badgeId: selectedBadge.id,
            badgeTitle: selectedBadge.title,
            grantedAt: new Date(),
          },
        ]);
        setFeedback({ type: 'success', text: res.message! });
      } else if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Rozet verilirken hata oluştu.' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevoke = async (userId: string, badgeId: string) => {
    setLoadingId(`REVOKE-${userId}-${badgeId}`);
    setFeedback(null);

    try {
      const res = await revokeBadgeAdmin({ targetUserId: userId, badgeId });
      if (res.success) {
        setUserBadges((prev) => prev.filter((ub) => !(ub.userId === userId && ub.badgeId === badgeId)));
        setFeedback({ type: 'success', text: res.message! });
      } else if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Rozet silinirken hata oluştu.' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
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

      {/* Grant Form Card */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-6 shadow-xl backdrop-blur-md">
        <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Kullanıcıya Rozet Verme Alanı
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* User Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Kullanıcı Seçin</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.username || u.email} ({u.userTag || u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Badge Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Verilecek Rozeti Seçin</label>
            <select
              value={selectedBadgeId}
              onChange={(e) => setSelectedBadgeId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGrant}
          disabled={loadingId === 'GRANT'}
          className="w-full py-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
        >
          {loadingId === 'GRANT' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Rozeti Kullanıcıya Tanımla</span>
        </button>
      </div>

      {/* Granted Badges Inventory Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Tanımlanmış Rozetler Listesi
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kullanıcı veya Tag ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5 border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
          {filteredUsers.map((u) => {
            const uBadges = userBadges.filter((ub) => ub.userId === u.id);

            return (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                    {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{u.name || u.username}</p>
                    <p className="text-xs font-mono text-purple-400">{u.userTag || u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {uBadges.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Henüz rozet verilmemiş</span>
                  ) : (
                    uBadges.map((ub) => (
                      <span key={ub.badgeId} className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                        <span>{ub.badgeTitle}</span>
                        <button
                          onClick={() => handleRevoke(u.id, ub.badgeId)}
                          disabled={loadingId === `REVOKE-${u.id}-${ub.badgeId}`}
                          className="hover:text-red-400 transition-colors ml-1"
                          title="Rozeti Geri Al"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
