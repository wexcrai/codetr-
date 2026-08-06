import { db } from './lib/db';

async function main() {
  const user = await db.user.updateMany({
    where: { email: 'ilyastekkan@gmail.com' },
    data: { role: 'ADMIN' },
  });
  console.log(`Updated ${user.count} user(s) to ADMIN`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
