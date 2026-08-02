import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminDestekClient } from "./admin-destek-client";
import { Headphones, LifeBuoy, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Admin Destek Yönetimi | CodeTR Admin",
};

export default async function AdminDestekPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin) redirect("/panel");

  const tickets = await db.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, username: true, userTag: true, image: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-blue-400" /> Destek Talepleri Yönetimi
          </h1>
          <p className="text-xs text-slate-400 mt-1">Kullanıcılardan gelen destek taleplerini inceleyin ve yanıtlayın.</p>
        </div>
      </div>

      <AdminDestekClient initialTickets={tickets} />
    </div>
  );
}
