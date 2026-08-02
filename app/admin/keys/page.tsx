import { getAdminKeys, getKeyStats } from '@/lib/actions/keys';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateKeyForm from './create-key-form';
import KeysTable from './keys-table';
import { KeyIcon, CheckCircle, XCircle, Users } from 'lucide-react';

export default async function AdminKeysPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/panel');
  }

  const [keys, stats] = await Promise.all([
    getAdminKeys(),
    getKeyStats()
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Anahtar Yönetimi</h1>
          <p className="text-zinc-400 mt-2">Platform erişim anahtarlarını, promosyon kodlarını ve ödülleri yönetin.</p>
        </div>
        <CreateKeyForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <KeyIcon className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Toplam Anahtar</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-medium">Aktif</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.active}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium">Kullanılmış</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.used}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-medium">İptal Edilmiş</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.revoked}</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <KeysTable keys={keys} />
      </div>
    </div>
  );
}
