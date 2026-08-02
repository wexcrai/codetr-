const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected...');

  const email = 'ilyastekkan@gmail.com';

  // Check if user exists
  const existing = await client.query(`SELECT id, role FROM users WHERE email = $1`, [email]);
  
  if (existing.rows.length > 0) {
    // Update to ADMIN
    const { id, role } = existing.rows[0];
    await client.query(`UPDATE users SET role = 'ADMIN' WHERE id = $1`, [id]);
    console.log(`✅ ${email} -> ADMIN (was: ${role}), ID: ${id}`);
  } else {
    // Create admin user
    const hashed = await bcrypt.hash('Admin123!', 12);
    const id = 'cuid_admin_ilyas';
    await client.query(`
      INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt")
      VALUES ($1, 'İlyas Tekkan', $2, $3, 'ADMIN', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET role = 'ADMIN'
    `, [id, email, hashed]);
    console.log(`✅ Created ADMIN user: ${email}`);
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
