const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // Get Python course structure
  const course = await db.course.findFirst({
    where: { slug: 'python' },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true, order: true }
          }
        }
      }
    }
  });

  if (!course) { console.log('Course not found'); return; }

  console.log(`\nCourse: ${course.title} (${course.id})`);
  course.chapters.forEach(ch => {
    console.log(`\nChapter ${ch.order}: ${ch.title} (${ch.id})`);
    ch.lessons.forEach(l => console.log(`  Lesson ${l.order}: ${l.title} (${l.id})`));
  });

  await db.$disconnect();
}

main().catch(console.error);
