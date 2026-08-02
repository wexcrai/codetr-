const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB...');

  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccessKeyType') THEN
        CREATE TYPE "AccessKeyType" AS ENUM ('COURSE_ACCESS','PREMIUM_MONTH','PREMIUM_YEAR','XP_BOOST','COIN_PACK','FULL_ACCESS');
      END IF;
    END $$;
  `);

  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccessKeyStatus') THEN
        CREATE TYPE "AccessKeyStatus" AS ENUM ('ACTIVE','USED','EXPIRED','REVOKED');
      END IF;
    END $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS "access_keys" (
      "id"          TEXT NOT NULL PRIMARY KEY,
      "key"         TEXT NOT NULL UNIQUE,
      "type"        "AccessKeyType" NOT NULL DEFAULT 'COURSE_ACCESS',
      "status"      "AccessKeyStatus" NOT NULL DEFAULT 'ACTIVE',
      "description" TEXT,
      "maxUses"     INTEGER NOT NULL DEFAULT 1,
      "usedCount"   INTEGER NOT NULL DEFAULT 0,
      "courseId"    TEXT,
      "xpAmount"    INTEGER NOT NULL DEFAULT 0,
      "coinAmount"  INTEGER NOT NULL DEFAULT 0,
      "createdById" TEXT NOT NULL,
      "expiresAt"   TIMESTAMP(3),
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL,
      FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS "key_redemptions" (
      "id"         TEXT NOT NULL PRIMARY KEY,
      "keyId"      TEXT NOT NULL,
      "userId"     TEXT NOT NULL,
      "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE ("keyId", "userId"),
      FOREIGN KEY ("keyId") REFERENCES "access_keys"("id") ON DELETE RESTRICT,
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    );
  `);

  await client.query(`CREATE INDEX IF NOT EXISTS "access_keys_key_idx" ON "access_keys"("key");`);
  await client.query(`CREATE INDEX IF NOT EXISTS "access_keys_status_idx" ON "access_keys"("status");`);

  console.log('✅ access_keys and key_redemptions tables created!');
  await client.end();
}

createTables().catch(e => { console.error(e); process.exit(1); });
