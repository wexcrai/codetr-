import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MesajlarClient } from "./mesajlar-client";
import { MessageSquare, Users, Send, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Canlı Mesajlaşma & Sohbet | CodeTR",
  description: "Eklediğin arkadaşlarınla birebir sohbet et, kod ve fikir paylaş.",
};

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const friendships = await db.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        select: { id: true, name: true, username: true, userTag: true, image: true, level: true, equippedBadge: true },
      },
    },
  });

  const friends = friendships.map((f) => f.friend);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold shadow-lg">
          <MessageSquare className="w-4 h-4 text-blue-400" /> CodeTR Birebir Canlı Chat
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Arkadaşlarla <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">Canlı Sohbet</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Ekli arkadaşlarınızla anlık mesajlaşın, kod parçacıkları ve yardım talepleri paylaşın.
        </p>
      </div>

      <MesajlarClient currentUserId={userId} friends={friends} />
    </div>
  );
}
