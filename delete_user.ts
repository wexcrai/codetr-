import { db } from './lib/db';

async function main() {
  await db.user.deleteMany({
    where: { email: 'ilyastekkan@gmail.com' }
  });
  console.log("Deleted user");
}

main().catch(console.error);
