'use client';

import { useState, useEffect } from 'react';
import { sendDirectMessage, getDirectMessages } from '@/lib/actions/messages';
import { Send, User, MessageSquare, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MesajlarClientProps {
  currentUserId: string;
  friends: any[];
}

export function MesajlarClient({ currentUserId, friends }: MesajlarClientProps) {
  const [selectedFriend, setSelectedFriend] = useState<any>(friends[0] || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load chat messages when selected friend changes
  useEffect(() => {
    if (!selectedFriend) return;

    setIsLoading(true);
    getDirectMessages(selectedFriend.id)
      .then((data) => setMessages(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedFriend]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend || !inputText.trim()) return;

    setIsSending(true);
    const msgText = inputText.trim();
    setInputText('');

    try {
      const res = await sendDirectMessage(selectedFriend.id, msgText);
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (friends.length === 0) {
    return (
      <div className="p-10 rounded-2xl border border-white/10 bg-white/5 text-center space-y-3">
        <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Sohbet Edecek Arkadaşınız Bulunmuyor</h3>
        <p className="text-xs text-slate-400">
          Sohbet edebilmek için önce <a href="/sosyal" className="text-purple-400 underline font-bold">Sosyal Ağ</a> sayfasından arkadaşlar ekleyin!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
      {/* Friends List Sidebar */}
      <div className="p-4 border-r border-slate-800 space-y-3 bg-slate-900/40">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Arkadaşlarım ({friends.length})</h3>

        <div className="space-y-1">
          {friends.map((f) => {
            const isSelected = selectedFriend?.id === f.id;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFriend(f)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left ${
                  isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                  {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : f.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate">{f.name || f.username}</p>
                  <p className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-purple-400'}`}>{f.userTag}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-2 flex flex-col justify-between bg-slate-950 p-6">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
              {selectedFriend?.image ? <img src={selectedFriend.image} alt="" className="w-full h-full object-cover" /> : selectedFriend?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{selectedFriend?.name || selectedFriend?.username}</h3>
              <span className="text-[10px] font-mono text-purple-400">{selectedFriend?.userTag}</span>
            </div>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 py-6 space-y-4 overflow-y-auto max-h-[380px] px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Mesajlar yükleniyor...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              Henüz mesaj bulunmuyor. İlk mesajı siz gönderin! 👋
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUserId;

              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{m.message}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">
                      {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-800 pt-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Gönder</span>
          </button>
        </form>
      </div>
    </div>
  );
}
