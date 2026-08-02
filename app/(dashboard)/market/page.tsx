import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SHOP_ITEMS } from "@/lib/shop-data";
import { MarketClient } from "./market-client";
import { ShoppingBag, Coins, Sparkles, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Market | CodeTR",
  description: "Altınların ile özel takviyeler, VIP rozetler ve erişim anahtarları al.",
};

export default async function MarketPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { coins: true, xp: true, level: true },
  });

  const coins = user?.coins ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold mb-3">
            <ShoppingBag className="w-3.5 h-3.5" /> CodeTR Mağaza &amp; Pazaryeri
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CodeTR <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">Market</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Derslerden ve günlük ödüllerden kazandığın Altınlar ile güçlendiriciler ve VIP içerikler satın al!
          </p>
        </div>

        {/* Coins Badge */}
        <div className="p-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-950/40 via-slate-900 to-amber-950/40 flex items-center gap-3 shadow-xl shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg">
            🪙
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Bakiye Altınınız</p>
            <p className="text-2xl font-extrabold text-yellow-400">{coins} 🪙</p>
          </div>
        </div>
      </div>

      {/* Market Client Grid */}
      <MarketClient userCoins={coins} items={SHOP_ITEMS} />
    </div>
  );
}
