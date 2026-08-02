const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  console.log('Cleaning up un-redeemed course enrollments for testing...');

  // Find all key redemptions
  const redemptions = await db.keyRedemption.findMany({
    include: { key: true }
  });

  const validEnrollments = new Set();
  for (const r of redemptions) {
    if (r.key && r.key.type === 'COURSE_ACCESS' && r.key.courseId) {
      validEnrollments.add(`${r.userId}_${r.key.courseId}`);
    }
  }

  // Also keep enrollments for ADMIN users if any
  const adminUsers = await db.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  const adminUserIds = new Set(adminUsers.map(u => u.id));

  const allEnrollments = await db.courseEnrollment.findMany();
  console.log(`Total current enrollments in DB: ${allEnrollments.length}`);

  let deletedCount = 0;
  for (const e of allEnrollments) {
    const keyStr = `${e.userId}_${e.courseId}`;
    const isAdmin = adminUserIds.has(e.userId);
    // If not redeemed via key and not admin, remove enrollment so key requirement can be tested
    if (!validEnrollments.has(keyStr) && !isAdmin) {
      await db.courseEnrollment.delete({ where: { id: e.id } });
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} un-redeemed test enrollments.`);
  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  db.$disconnect();
  process.exit(1);
});
