import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { EditProfileClient } from "./edit-profile-client";

export const metadata = {
  title: "Profili Düzenle | CodeTR",
  description: "Profil detaylarını, unvanını ve sosyal hesaplarını özelleştir.",
};

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true, bio: true, image: true, theme: true },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Profili Özelleştir</h1>
        <p className="text-slate-400 text-sm mt-1">Biyografini, unvanını ve kişisel tercihlerini ayarla.</p>
      </div>

      <EditProfileClient initialUser={user} />
    </div>
  );
}
