"use client";

import { useState } from 'react';
import { createAccessKey } from '@/lib/actions/keys';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Copy, Check } from 'lucide-react';

export default function CreateKeyForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    type: 'COURSE_ACCESS',
    description: '',
    maxUses: 1,
    courseId: 'python-101',
    xpAmount: 100,
    coinAmount: 50,
    expiresAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createAccessKey({
        type: formData.type,
        description: formData.description,
        maxUses: Number(formData.maxUses),
        courseId: formData.type === 'COURSE_ACCESS' ? formData.courseId : undefined,
        xpAmount: formData.type === 'XP_BOOST' ? Number(formData.xpAmount) : undefined,
        coinAmount: formData.type === 'COIN_PACK' ? Number(formData.coinAmount) : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
      });
      setCreatedKey(result.key);
    } catch (error) {
      console.error(error);
      alert('Hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all"
      >
        <Plus className="w-4 h-4" />
        Yeni Anahtar Oluştur
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Yeni Anahtar Oluştur</h2>
                <button onClick={() => { setIsOpen(false); setCreatedKey(null); }} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createdKey ? (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-emerald-400 text-sm font-medium mb-2 text-center">Anahtar başarıyla oluşturuldu!</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-black/50 px-3 py-2 rounded-lg text-emerald-300 font-mono text-center tracking-wider">
                        {createdKey}
                      </code>
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
                      >
                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsOpen(false); setCreatedKey(null); }}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Tür</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="COURSE_ACCESS">Kurs Erişimi</option>
                      <option value="PREMIUM_MONTH">Premium (Aylık)</option>
                      <option value="PREMIUM_YEAR">Premium (Yıllık)</option>
                      <option value="XP_BOOST">XP Paketi</option>
                      <option value="COIN_PACK">Altın Paketi</option>
                      <option value="FULL_ACCESS">Tam Erişim</option>
                    </select>
                  </div>

                  {formData.type === 'COURSE_ACCESS' && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Kurs ID</label>
                      <input 
                        type="text" 
                        value={formData.courseId}
                        onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                  )}

                  {formData.type === 'XP_BOOST' && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">XP Miktarı</label>
                      <input 
                        type="number" 
                        value={formData.xpAmount}
                        onChange={(e) => setFormData({...formData, xpAmount: Number(e.target.value)})}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        min="1"
                        required
                      />
                    </div>
                  )}

                  {formData.type === 'COIN_PACK' && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Altın Miktarı</label>
                      <input 
                        type="number" 
                        value={formData.coinAmount}
                        onChange={(e) => setFormData({...formData, coinAmount: Number(e.target.value)})}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        min="1"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Açıklama</label>
                    <input 
                      type="text" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Max. Kullanım</label>
                      <input 
                        type="number" 
                        value={formData.maxUses}
                        onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Son Kullanım</label>
                      <input 
                        type="date" 
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
