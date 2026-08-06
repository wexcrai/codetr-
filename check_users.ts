import { db } from './lib/db';

async function main() {
  const users = await db.user.findMany({
    select: { email: true, role: true, name: true }
  });
  console.log(users);
}

main().catch(console.error);
