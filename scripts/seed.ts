/**
 * Supabase Seeder
 * ───────────────
 * Creates all mock users in Supabase Auth.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never expose this client-side).
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Support both legacy (SUPABASE_SERVICE_ROLE_KEY) and new Supabase secret key name
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing env vars. Make sure .env.local has:');
  console.error('    NEXT_PUBLIC_SUPABASE_URL');
  console.error('    SUPABASE_SECRET_KEY  (or SUPABASE_SERVICE_ROLE_KEY for legacy)');
  process.exit(1);
}

// Admin client — bypasses RLS & can create users without email confirmation
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Seed data ────────────────────────────────────────────────────────────────
// Default password for all seeded users — change after first login!
const DEFAULT_PASSWORD = 'Carbon@2026!';

const users = [
  {
    email: 'j.harrington@carboncredit.io',
    name: 'James Harrington',
    role: 'Admin',
    userType: 'Default User',
    status: 'Active',
  },
  {
    email: 's.chen@carboncredit.io',
    name: 'Sophia Chen',
    role: 'Manager',
    userType: 'Future User Lvl 1',
    status: 'Active',
  },
  {
    email: 'm.webb@carboncredit.io',
    name: 'Marcus Webb',
    role: 'Manager',
    userType: 'Future User Lvl 1',
    status: 'Active',
  },
  {
    email: 'p.nair@carboncredit.io',
    name: 'Priya Nair',
    role: 'Viewer',
    userType: 'Future User Lvl 2',
    status: 'Pending',
  },
  {
    email: 'l.fontaine@carboncredit.io',
    name: 'Lucas Fontaine',
    role: 'Viewer',
    userType: 'Default User',
    status: 'Inactive',
  },
  {
    email: 'a.okonkwo@carboncredit.io',
    name: 'Aisha Okonkwo',
    role: 'Manager',
    userType: 'Future User Lvl 2',
    status: 'Active',
  },
];

// ─── Seeder ───────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n🌱  Seeding ${users.length} users into Supabase Auth...\n`);

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true, // skip confirmation email
      user_metadata: {
        name: user.name,
        role: user.role,
        userType: user.userType,
        status: user.status,
      },
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`⚠️   ${user.email} — already exists, skipping`);
      } else {
        console.error(`❌  ${user.email} — ${error.message}`);
      }
    } else {
      console.log(`✅  ${user.email} — created (id: ${data.user.id})`);
    }
  }

  console.log('\n─────────────────────────────────────────────────');
  console.log('🔑  Default password for all users:');
  console.log(`    ${DEFAULT_PASSWORD}`);
  console.log('─────────────────────────────────────────────────');
  console.log('\n📋  Login credentials summary:\n');
  users.forEach((u) =>
    console.log(`    ${u.role.padEnd(8)}  ${u.email}`)
  );
  console.log('\n⚠️   Remember to change passwords after first login!\n');
}

seed().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
