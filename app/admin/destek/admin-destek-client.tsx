'use client';

import { useState } from 'react';
import { replyAndResolveTicketAdmin } from '@/lib/actions/support';
import { MessageSquare, CheckCircle2, Clock, Loader2, Send, Filter, User } from 'lucide-react';

interface AdminDestekClientProps {
  initialTickets: any[];
}

export function AdminDestekClient({ initialTickets }: AdminDestekClientProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [statusMap, setStatusMap] = useState<Record<string, any>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const handleReplySubmit = async (ticketId: string) => {
    const adminReply = replyTextMap[ticketId];
    const status = statusMap[ticketId] || 'RESOLVED';

    if (!adminReply?.trim()) return;

    setLoadingId(ticketId);

    try {
      const res = await replyAndResolveTicketAdmin({
        ticketId,
        adminReply,
        status,
      });

      if (res.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, adminReply, status } : t))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === st
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {st === 'ALL' ? 'Tümü' : st === 'OPEN' ? 'Açık' : st === 'IN_PROGRESS' ? 'İşlemde' : 'Çözüldü'}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-white/5 border border-white/10">
            Filtreye uygun destek talebi bulunmuyor.
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div key={t.id} className="p-6 rounded-2xl border border-white/10 bg-slate-900 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                      {t.category}
                    </span>
                    <span className="text-xs text-slate-400">• {new Date(t.createdAt).toLocaleString('tr-TR')}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{t.subject}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-white font-semibold">{t.user.name || t.user.email}</span>
                    <span className="font-mono text-purple-400">{t.user.userTag}</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    t.status === 'OPEN'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      : t.status === 'IN_PROGRESS'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans">
                {t.message}
              </div>

              {/* Existing Reply */}
              {t.adminReply && (
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200">
                  <strong>Mevcut Yanıt:</strong> {t.adminReply}
                </div>
              )}

              {/* Admin Reply Box */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <textarea
                  value={replyTextMap[t.id] ?? t.adminReply ?? ''}
                  onChange={(e) => setReplyTextMap((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  placeholder="Kullanıcıya yanıtınızı buraya yazın..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />

                <div className="flex justify-between items-center">
                  <select
                    value={statusMap[t.id] ?? t.status}
                    onChange={(e) => setStatusMap((prev) => ({ ...prev, [t.id]: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="OPEN">🟡 Açık</option>
                    <option value="IN_PROGRESS">🔵 İşlemde</option>
                    <option value="RESOLVED">🟢 Çözüldü</option>
                    <option value="CLOSED">⚪ Kapatıldı</option>
                  </select>

                  <button
                    onClick={() => handleReplySubmit(t.id)}
                    disabled={loadingId === t.id}
                    className="px-5 py-2 rounded-xl font-bold bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    {loadingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Yanıtı Kaydet &amp; Gönder</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
