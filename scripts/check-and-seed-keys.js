const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const adminUser = await db.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    console.log('No admin user found.');
    return;
  }

  const existingKeys = await db.accessKey.findMany();
  console.log(`Existing keys count: ${existingKeys.length}`);

  const sampleKeys = [
    {
      key: 'CODETR-PYTHON-2025',
      type: 'COURSE_ACCESS',
      description: 'Python Programlama Kursu Erişim Anahtarı',
      maxUses: 100,
      status: 'ACTIVE',
      createdById: adminUser.id,
    },
    {
      key: 'CODETR-JSKEY-2025',
      type: 'COURSE_ACCESS',
      description: 'JavaScript Kursu Erişim Anahtarı',
      maxUses: 100,
      status: 'ACTIVE',
      createdById: adminUser.id,
    },
    {
      key: 'CODETR-VIPKEY-9999',
      type: 'FULL_ACCESS',
      description: 'Tüm Kurslara Tam Erişim Anahtarı (VIP)',
      maxUses: 1000,
      status: 'ACTIVE',
      createdById: adminUser.id,
    },
    {
      key: 'CODETR-PREMIUM-100',
      type: 'PREMIUM_YEAR',
      description: '1 Yıllık Premium Erişim Anahtarı',
      maxUses: 500,
      status: 'ACTIVE',
      createdById: adminUser.id,
    }
  ];

  for (const k of sampleKeys) {
    const exists = await db.accessKey.findUnique({ where: { key: k.key } });
    if (!exists) {
      await db.accessKey.create({ data: k });
      console.log(`✅ Created sample key: ${k.key} (${k.description})`);
    } else {
      console.log(`ℹ️ Key already exists: ${k.key}`);
    }
  }

  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  db.$disconnect();
  process.exit(1);
});
