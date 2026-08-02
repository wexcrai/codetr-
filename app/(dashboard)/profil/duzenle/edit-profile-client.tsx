'use client';

import { useState } from 'react';
import { User, Sparkles, Check, Save, Loader2, Award, Shield } from 'lucide-react';
import { updateProfile } from '@/lib/actions/gamification';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileClientProps {
  initialUser: any;
}

const TITLES = [
  '⚡ Algoritma Şampiyonu',
  '🐍 Python Kurdu',
  '🚀 Fullstack Master',
  '💻 Frontend Ustası',
  '🦀 Rust Tutkunu',
  '☕ Java Geliştirici',
];

export function EditProfileClient({ initialUser }: EditProfileClientProps) {
  const [name, setName] = useState(initialUser?.name || '');
  const [username, setUsername] = useState(initialUser?.username || '');
  const [bio, setBio] = useState(initialUser?.bio || '');
  const [selectedTitle, setSelectedTitle] = useState(TITLES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await updateProfile({
        name,
        username,
        bio: `${selectedTitle} • ${bio}`,
      });

      if (res?.success) {
        setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi! 🎉' });
      } else if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Profil güncellenirken bir hata oluştu.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <Shield className="w-4 h-4 text-red-400" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6 backdrop-blur-md">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Ad Soyad</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
            required
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Kullanıcı Adı (@username)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
            required
          />
        </div>

        {/* Custom Title Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-400" /> Özel Unvan Seçimi
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TITLES.map((title) => (
              <button
                type="button"
                key={title}
                onClick={() => setSelectedTitle(title)}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  selectedTitle === title
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Biyografi (Hakkımda)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Kendinden bahset..."
            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 text-sm"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>Değişiklikleri Kaydet</span>
      </button>
    </form>
  );
}
