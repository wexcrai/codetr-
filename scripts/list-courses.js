const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

db.course.findMany({ select: { id: true, title: true, slug: true, language: true } })
  .then(c => { console.log(JSON.stringify(c, null, 2)); db.$disconnect(); })
  .catch(e => { console.error(e); process.exit(1); });
