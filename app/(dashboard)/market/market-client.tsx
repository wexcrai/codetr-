'use client';

import { useState } from 'react';
import { buyShopItem } from '@/lib/actions/shop';
import { ShopItem } from '@/lib/shop-data';
import { ShoppingBag, Coins, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketClientProps {
  userCoins: number;
  items: ShopItem[];
}

export function MarketClient({ userCoins: initialCoins, items }: MarketClientProps) {
  const [coins, setCoins] = useState(initialCoins);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleBuy = async (item: ShopItem) => {
    if (coins < item.price) {
      setFeedback({
        type: 'error',
        message: `Yetersiz Altın! ${item.name} için ${item.price} Altın gerekiyor. Sende: ${coins} 🪙`,
      });
      return;
    }

    setLoadingItemId(item.id);
    setFeedback(null);

    try {
      const res = await buyShopItem(item.id);
      if (res.success) {
        setCoins(res.remainingCoins ?? coins - item.price);
        setFeedback({
          type: 'success',
          message: res.message || '',
        });
      } else if (res.error) {
        setFeedback({
          type: 'error',
          message: res.error,
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Satın alma işlemi başarısız oldu.' });
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs text-slate-400 hover:text-white underline ml-4"
            >
              Kapat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isAffordable = coins >= item.price;
          const isBuying = loadingItemId === item.id;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between relative overflow-hidden group backdrop-blur-md shadow-xl"
            >
              <div className="space-y-4">
                {/* Top Badge & Icon */}
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center text-3xl shadow-lg">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 uppercase tracking-wide">
                    {item.badge}
                  </span>
                </div>

                {/* Name & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Price & Buy Action */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 font-extrabold text-yellow-400 text-lg">
                  <span>{item.price}</span>
                  <span className="text-base">🪙</span>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={isBuying || !isAffordable}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    isAffordable
                      ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-slate-950 hover:opacity-90 active:scale-95 shadow-yellow-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...
                    </>
                  ) : isAffordable ? (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Satın Al
                    </>
                  ) : (
                    'Yetersiz Altın'
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
