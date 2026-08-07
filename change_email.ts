import { db } from './lib/db';

async function main() {
  await db.user.update({
    where: { email: 'ilyastekkan@gmail.com' },
    data: { email: 'ilyastekkan_old@gmail.com' }
  });
  console.log("Email changed");
}

main().catch(console.error);
