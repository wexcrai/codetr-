import { db } from "@/lib/db";
import { Search, UserCog, Ban, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 50;

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.user.count({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-slate-400 mt-1">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin. ({total} toplam)</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex gap-4">
          <form className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="İsim veya e-posta ile ara..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">Seviye & XP</th>
                <th className="px-6 py-4">Seri</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Kayıt</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">Seviye {user.level}</div>
                    <div className="text-xs text-slate-500">{user.xp} XP</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500">🔥</span>
                      <span>{user.currentStreak} Gün</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs">
                      <option value="USER" selected={user.role === 'USER'}>USER</option>
                      <option value="MODERATOR" selected={user.role === 'MODERATOR'}>MODERATOR</option>
                      <option value="ADMIN" selected={user.role === 'ADMIN'}>ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {user.createdAt.toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Profili Düzenle">
                        <UserCog className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Devre Dışı Bırak">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {total > limit && (
          <div className="p-4 border-t border-slate-800 flex justify-center">
            <div className="flex gap-2">
              {page > 1 && <Link href={`/admin/kullanicilar?page=${page - 1}&q=${query}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">Önceki</Link>}
              <Link href={`/admin/kullanicilar?page=${page + 1}&q=${query}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">Sonraki</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
