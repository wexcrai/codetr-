import { auth } from '@/auth';
import { getDailyRewardStatus } from '@/lib/actions/daily-rewards';
import { RewardCalendar } from './reward-calendar';
import { Flame, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Günlük Ödüller | CodeTR',
  description: 'Her gün giriş yap, serini koru ve ödüllerini topla.',
};

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');

  const rewardStatus = await getDailyRewardStatus();

  const streak = rewardStatus?.streak || 0;
  const claimedToday = rewardStatus?.claimedToday || false;
  const currentDay = rewardStatus?.currentDayNumber || 1;
  const claimedDays = rewardStatus?.claimedDays || [];
  const rewards = rewardStatus?.allRewards || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-4 pt-6 mb-10">
        <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 px-5 py-2 rounded-full mb-2 shadow-lg">
          <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
          <span className="font-extrabold text-base">{streak} Günlük Seri</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Günlük <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">Ödüller</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
          Her gün giriş yaparak serini koru, daha fazla altın ve XP kazan! Her 7 günde bir özel sürpriz hediye paketleri seni bekliyor.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <RewardCalendar
          initialStreak={streak}
          initialClaimedToday={claimedToday}
          initialCurrentDay={currentDay}
          claimedDays={claimedDays}
          rewards={rewards}
        />
      </div>
    </div>
  );
}
