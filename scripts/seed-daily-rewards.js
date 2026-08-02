const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  console.log('Seeding Daily Rewards (Days 1-30)...');

  for (let i = 1; i <= 30; i++) {
    const isMilestone = i % 7 === 0;
    const baseCoins = 10 + (Math.floor(i / 5) * 5);
    const baseXP = 20 + (Math.floor(i / 3) * 10);

    const coinReward = isMilestone ? baseCoins * 2 : baseCoins;
    const xpReward = isMilestone ? baseXP * 2 : baseXP;
    const specialReward = isMilestone ? `GÜN_${i}_MILESTONE_GIFT` : null;

    await db.dailyReward.upsert({
      where: { day: i },
      update: { coinReward, xpReward, specialReward },
      create: { day: i, coinReward, xpReward, specialReward }
    });
  }

  const count = await db.dailyReward.count();
  console.log(`✅ Daily Rewards ready: ${count} days seeded.`);
  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  db.$disconnect();
  process.exit(1);
});
