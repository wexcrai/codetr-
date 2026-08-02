"use client";

import { useState } from 'react';
import { revokeAccessKey } from '@/lib/actions/keys';
import { Copy, Trash2, Search, Box, FileKey } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  USED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  REVOKED: 'bg-red-500/10 text-red-400 border-red-500/20',
  EXPIRED: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  USED: 'Kullanıldı',
  REVOKED: 'İptal',
  EXPIRED: 'Süresi Doldu',
};

const typeLabels: Record<string, string> = {
  COURSE_ACCESS: 'Kurs Erişimi',
  PREMIUM_MONTH: 'Premium (Aylık)',
  PREMIUM_YEAR: 'Premium (Yıllık)',
  XP_BOOST: 'XP Paketi',
  COIN_PACK: 'Altın Paketi',
  FULL_ACCESS: 'Tam Erişim',
};

export default function KeysTable({ keys }: { keys: any[] }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);

  const filteredKeys = keys.filter(key => {
    const matchesFilter = filter === 'ALL' || key.status === filter;
    const desc = key.description ?? '';
    const matchesSearch = key.key.toLowerCase().includes(search.toLowerCase()) || 
                          desc.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRevoke = async (id: string) => {
    if (confirm('Bu anahtarı iptal etmek istediğinize emin misiniz?')) {
      setRevoking(id);
      try {
        await revokeAccessKey(id);
      } finally {
        setRevoking(null);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          {['ALL', 'ACTIVE', 'USED', 'REVOKED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === tab ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {tab === 'ALL' ? 'Tümü' : statusLabels[tab]}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Anahtar veya açıklama ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-zinc-950 border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredKeys.length > 0 ? (
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 text-zinc-300 font-medium">
              <tr>
                <th className="px-6 py-4">Anahtar</th>
                <th className="px-6 py-4">Tür</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Kullanım</th>
                <th className="px-6 py-4">Oluşturan</th>
                <th className="px-6 py-4">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredKeys.map((key) => (
                <tr key={key.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        {key.key}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(key.key)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                        title="Kopyala"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-zinc-500" />
                      <span>{typeLabels[key.type] || key.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={key.description}>
                    {key.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[key.status] || statusColors.EXPIRED}`}>
                      {statusLabels[key.status] || key.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">
                      {key.usedCount} / {key.maxUses}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {key.createdBy?.name || 'Bilinmiyor'}
                  </td>
                  <td className="px-6 py-4">
                    {key.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        disabled={revoking === key.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>İptal Et</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800"
            >
              <FileKey className="w-8 h-8 text-zinc-600" />
            </motion.div>
            <h3 className="text-lg font-medium text-white mb-1">Kayıt Bulunamadı</h3>
            <p className="text-zinc-500 max-w-sm">
              Arama kriterlerinize uyan bir anahtar bulunamadı veya henüz hiç anahtar oluşturulmamış.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
