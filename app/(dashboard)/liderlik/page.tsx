import { db } from '@/lib/db';
import { auth } from '@/auth';
import Link from 'next/link';
import { Trophy, Flame, Star, Medal } from 'lucide-react';
import { formatXP } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Liderlik Tablosu | CodeTR',
  description: 'En çok puan toplayan yazılımcılarla yarış.',
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/giris');

  const { tab = 'hafta' } = (await searchParams) || {};

  const currentUserId = session.user.id;

  // Real-time Leaderboard Query
  const users = await db.user.findMany({
    orderBy: { xp: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      xp: true,
      level: true,
      currentStreak: true,
    },
  });

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  // Current user's rank position
  const currentUserIndex = users.findIndex((u) => u.id === currentUserId);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-4 pt-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Liderlik <span className="gradient-text">Tablosu</span>
        </h1>
        <p className="text-slate-400 text-sm">En çok XP toplayan yazılımcılarla yarış, sıralamada yüksel!</p>

        <div className="flex justify-center mt-6">
          <div className="glass-card inline-flex p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <Link
              href="/liderlik?tab=hafta"
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === 'hafta'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bu Hafta
            </Link>
            <Link
              href="/liderlik?tab=ay"
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === 'ay'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bu Ay
            </Link>
            <Link
              href="/liderlik?tab=tum"
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === 'tum'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tüm Zamanlar
            </Link>
          </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-3 sm:gap-6 mt-12 mb-16 h-64">
          {/* Rank 2 */}
          {topThree[1] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-400 overflow-hidden bg-slate-800 shadow-xl">
                  {topThree[1].image ? (
                    <img src={topThree[1].image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-xl">
                      {topThree[1].name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-950 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-950">
                  2
                </div>
              </div>
              <div className="font-bold text-sm text-slate-200">{topThree[1].name?.split(' ')[0] || 'Kullanıcı'}</div>
              <div className="text-slate-400 text-xs font-bold">{formatXP(topThree[1].xp)} XP</div>
              <div className="w-20 sm:w-28 h-24 bg-gradient-to-t from-slate-600/30 to-slate-400/40 mt-4 rounded-t-2xl border border-slate-500/50 border-b-0 relative overflow-hidden" />
            </div>
          )}

          {/* Rank 1 */}
          {topThree[0] && (
            <div className="flex flex-col items-center z-10 animate-in slide-in-from-bottom-12 duration-700">
              <div className="relative mb-3">
                <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-bounce" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-slate-800 shadow-2xl ring-4 ring-yellow-400/20">
                  {topThree[0].image ? (
                    <img src={topThree[0].image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-yellow-400 text-2xl">
                      {topThree[0].name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-950 text-sm font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-950">
                  1
                </div>
              </div>
              <div className="font-bold text-base sm:text-lg text-yellow-400 drop-shadow-sm">
                {topThree[0].name?.split(' ')[0] || 'Kullanıcı'}
              </div>
              <div className="text-yellow-200/90 text-sm font-extrabold">{formatXP(topThree[0].xp)} XP</div>
              <div className="w-24 sm:w-32 h-32 bg-gradient-to-t from-yellow-600/30 to-yellow-500/50 mt-4 rounded-t-2xl border border-yellow-500/50 border-b-0 relative overflow-hidden" />
            </div>
          )}

          {/* Rank 3 */}
          {topThree[2] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-6 duration-700">
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-600 overflow-hidden bg-slate-800 shadow-xl">
                  {topThree[2].image ? (
                    <img src={topThree[2].image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-amber-500 text-xl">
                      {topThree[2].name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-amber-950 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-950">
                  3
                </div>
              </div>
              <div className="font-bold text-sm text-slate-200">{topThree[2].name?.split(' ')[0] || 'Kullanıcı'}</div>
              <div className="text-amber-400 text-xs font-bold">{formatXP(topThree[2].xp)} XP</div>
              <div className="w-20 sm:w-28 h-18 bg-gradient-to-t from-amber-700/30 to-amber-600/40 mt-4 rounded-t-2xl border border-amber-600/50 border-b-0 relative overflow-hidden" />
            </div>
          )}
        </div>
      )}

      {/* User Own Rank Card if not in top 3 */}
      {currentUserRank && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-white font-medium shadow-lg">
          <div className="flex items-center gap-3">
            <Medal className="w-5 h-5 text-blue-400" />
            <span>Mevcut Sıralamanız: <strong className="text-blue-400 font-extrabold">#{currentUserRank}</strong></span>
          </div>
          <span className="text-xs text-blue-300 font-semibold">Tebrikler! Kod yazarak üst sıralara tırman.</span>
        </div>
      )}

      {/* Leaderboard Table (Ranks 4-100) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="divide-y divide-white/5">
          {rest.map((user, idx) => {
            const rank = idx + 4;
            const isCurrentUser = user.id === currentUserId;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  isCurrentUser ? 'bg-blue-500/20 border-l-4 border-l-blue-500 font-bold' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center font-bold text-slate-400 text-sm">#{rank}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-300 text-sm">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      {user.name || user.username || 'Kullanıcı'}
                      {isCurrentUser && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-bold">
                          Sen
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">Seviye {user.level}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {user.currentStreak > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-400 font-bold">
                      <Flame className="w-3.5 h-3.5 streak-fire" />
                      {user.currentStreak} gün
                    </div>
                  )}
                  <div className="text-sm font-extrabold text-blue-400">{formatXP(user.xp)} XP</div>
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">Henüz sıralamada kimse bulunmuyor.</div>
          )}
        </div>
      </div>
    </div>
  );
}
