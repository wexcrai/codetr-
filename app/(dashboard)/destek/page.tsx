import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSupportTickets } from "@/lib/actions/support";
import { DestekClient } from "./destek-client";
import { HelpCircle, MessageSquare, Headphones, LifeBuoy } from "lucide-react";

export const metadata = {
  title: "Destek & İletişim | CodeTR",
  description: "7/24 Destek talebi oluştur, soru sor ve yardım al.",
};

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const tickets = await getUserSupportTickets();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold shadow-lg">
          <Headphones className="w-4 h-4 text-blue-400" /> CodeTR 7/24 Destek Merkezi
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Destek &amp; <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">İletişim Talebi</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Teknik sorunlar, kurs içerikleri veya önerileriniz için kolayca destek talebi oluşturun.
        </p>
      </div>

      <DestekClient initialTickets={tickets} />
    </div>
  );
}
