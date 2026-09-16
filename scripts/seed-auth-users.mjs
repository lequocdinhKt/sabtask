/**
 * Seed Supabase Auth demo users with fixed UUIDs.
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env (never commit the service key).
 * Run BEFORE applying supabase_schema.sql seed section.
 *
 * Usage: node scripts/seed-auth-users.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing required env for seed:auth:');
  if (!url) console.error('  - SUPABASE_URL');
  if (!serviceKey) {
    console.error('  - SUPABASE_SERVICE_ROLE_KEY  (KHÔNG phải ANON_KEY)');
    console.error('    Lấy tại: Supabase Dashboard → Project Settings → API → service_role (secret)');
    console.error('    Thêm vào .env rồi chạy lại: npm run seed:auth');
  }
  console.error('');
  console.error('Gợi ý: nếu đã chạy thành công src/supabase_schema.sql (có seed auth.users),');
  console.error('bạn KHÔNG cần seed:auth — đăng nhập luôn bằng TAI_KHOAN.md.');
  process.exit(1);
}

const DEMO_USERS = [
  {
    id: 'a1111111-1111-4111-8111-111111111111',
    email: 'admin@sabtask.com',
    password: 'admin123',
    name: 'Nguyễn Văn Admin',
    role: 'ADMIN',
    job_role: 'Product Owner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    id: 'a2222222-2222-4222-8222-222222222222',
    email: 'sarah@sabtask.com',
    password: 'user123',
    name: 'Sarah Miller',
    role: 'MEMBER',
    job_role: 'UI Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 'a3333333-3333-4333-8333-333333333333',
    email: 'mike@sabtask.com',
    password: 'user123',
    name: 'Mike Ross',
    role: 'MEMBER',
    job_role: 'Backend Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
  {
    id: 'a4444444-4444-4444-8444-444444444444',
    email: 'emily@sabtask.com',
    password: 'user123',
    name: 'Emily Wong',
    role: 'MEMBER',
    job_role: 'QA Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
  {
    id: 'a5555555-5555-4555-8555-555555555555',
    email: 'lan@sabtask.com',
    password: 'user123',
    name: 'Trần Thị Lan',
    role: 'MEMBER',
    job_role: 'Frontend Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan',
  },
];

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertUser(demo) {
  const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = listed?.users?.find((u) => u.email?.toLowerCase() === demo.email.toLowerCase());

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: demo.password,
      email_confirm: true,
      user_metadata: {
        name: demo.name,
        role: demo.role,
        job_role: demo.job_role,
        avatar: demo.avatar,
      },
    });
    if (error) throw error;
    console.log(`Updated auth user ${demo.email} (id=${existing.id})`);
    if (existing.id !== demo.id) {
      console.warn(
        `  WARNING: existing id ${existing.id} != expected ${demo.id}. Re-create Auth users or remap seed.`
      );
    }
    return;
  }

  const { error } = await admin.auth.admin.createUser({
    id: demo.id,
    email: demo.email,
    password: demo.password,
    email_confirm: true,
    user_metadata: {
      name: demo.name,
      role: demo.role,
      job_role: demo.job_role,
      avatar: demo.avatar,
    },
  });
  if (error) throw error;
  console.log(`Created auth user ${demo.email} (${demo.id})`);
}

async function main() {
  for (const demo of DEMO_USERS) {
    await upsertUser(demo);
  }
  console.log('Done. Next: run src/supabase_schema.sql in Supabase SQL Editor.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
