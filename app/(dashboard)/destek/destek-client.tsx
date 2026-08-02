'use client';

import { useState } from 'react';
import { createSupportTicket } from '@/lib/actions/support';
import { MessageSquare, Plus, CheckCircle2, Clock, ShieldAlert, Loader2, Send, ChevronDown, HelpCircle, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DestekClientProps {
  initialTickets: any[];
}

export function DestekClient({ initialTickets }: DestekClientProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('TEKNIK');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await createSupportTicket({
        subject,
        category,
        message,
        priority,
      });

      if (res.success) {
        setFeedback({ type: 'success', text: res.message! });
        setTickets((prev) => [
          {
            id: res.ticketId,
            subject,
            category,
            message,
            priority,
            status: 'OPEN',
            createdAt: new Date(),
          },
          ...prev,
        ]);
        setSubject('');
        setMessage('');
        setIsFormOpen(false);
      } else if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Destek talebi oluşturulamadı.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Ticket CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border border-blue-500/30 bg-blue-950/20 backdrop-blur-md shadow-xl">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-blue-400" /> Bir Sorun mu Var?
          </h2>
          <p className="text-xs text-slate-300">Ekibimiz sorularınızı en geç 24 saat içinde yanıtlar.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni Destek Talebi Oluştur
        </button>
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

      {/* Ticket Form Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-2xl"
          >
            <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">Yeni Destek Talebi Formu</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Konu Başlığı</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Örn: Python dersinde kod çalıştırma hatası"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="TEKNIK">Teknik Sorun &amp; Hata</option>
                  <option value="ICERIK">Kurs İçerik Hatası</option>
                  <option value="ODEME">Market &amp; Bakiye</option>
                  <option value="ONERI">Öneri &amp; Geribildirim</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Mesajınız &amp; Detaylar</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Yaşadığınız sorunu veya talebinizi detaylıca açıklayın..."
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white text-xs flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Gönder</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tickets List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" /> Taleplerim ({tickets.length})
        </h3>

        {tickets.length === 0 ? (
          <div className="p-10 rounded-2xl border border-white/10 bg-white/5 text-center space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">Henüz destek talebiniz bulunmuyor.</p>
            <p className="text-xs text-slate-400">Herhangi bir sorunuz veya öneriniz olduğunda yukarıdaki butona tıklayarak talep oluşturabilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 backdrop-blur-md shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                      {t.category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{t.subject}</h4>
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
                    {t.status === 'OPEN' ? '🟡 Açık' : t.status === 'IN_PROGRESS' ? '🔵 İşlemde' : '🟢 Çözüldü'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 font-sans">{t.message}</p>

                {t.adminReply && (
                  <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                    <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" /> CodeTR Destek Ekibi Yanıtı:
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{t.adminReply}</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 text-right">
                  Oluşturulma: {new Date(t.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
