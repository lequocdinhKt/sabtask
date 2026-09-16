-- =============================================================================
-- File: supabase_schema.sql
-- Trách nhiệm: Schema PostgreSQL + RLS + seed demo cho SabTask (Supabase Auth).
-- Liên quan: supabaseClient.ts, scripts/seed-auth-users.mjs, SETUP.md, TAI_KHOAN.md
--
-- CHẠY: copy toàn bộ file này vào Supabase SQL Editor → Run.
-- File tự tạo auth.users (email/password demo) rồi mới seed public.*.
-- Script seed-auth-users.mjs là tuỳ chọn (cùng UUID/password).
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 0. CLEANUP
-- Không ALTER/DISABLE trigger trên auth.users (SQL Editor không phải owner → lỗi 42501).
do $$ begin
  drop trigger if exists on_auth_user_created on auth.users;
exception
  when insufficient_privilege then
    raise notice 'Skip drop trigger on auth.users (not owner) — sẽ recreate nếu được phép.';
  when undefined_object then
    null;
end $$;

do $$ begin
  drop function if exists public.handle_new_user() cascade;
exception
  when insufficient_privilege then
    raise notice 'Skip drop handle_new_user (auth trigger vẫn giữ) — sẽ CREATE OR REPLACE.';
end $$;

drop function if exists public.is_admin() cascade;
drop function if exists public.is_project_member(uuid) cascade;
drop function if exists public.notify_task_assignment() cascade;
drop function if exists public.notify_task_status_change() cascade;
drop function if exists public.notify_new_comment() cascade;

drop table if exists messages cascade;
drop table if exists channels cascade;
drop table if exists time_entries cascade;
drop table if exists notifications cascade;
drop table if exists comments cascade;
drop table if exists subtasks cascade;
drop table if exists tasks cascade;
drop table if exists project_members cascade;
drop table if exists projects cascade;
drop table if exists users cascade;

drop type if exists task_status cascade;
drop type if exists priority cascade;
drop type if exists user_role cascade;
drop type if exists channel_type cascade;

-- 1. ENUMS
create type task_status as enum ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
create type priority as enum ('LOW', 'MEDIUM', 'HIGH');
create type user_role as enum ('ADMIN', 'MEMBER');
create type channel_type as enum ('TEXT', 'VOICE');

-- Fixed demo auth UUIDs (must match scripts/seed-auth-users.mjs)
-- admin  a1111111-1111-4111-8111-111111111111
-- sarah  a2222222-2222-4222-8222-222222222222
-- mike   a3333333-3333-4333-8333-333333333333
-- emily  a4444444-4444-4444-8444-444444444444
-- lan    a5555555-5555-4555-8555-555555555555

-- 2. TABLES

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar text,
  role user_role default 'MEMBER',
  job_role text,
  email text
);

create table projects (
  id text primary key,
  name text not null,
  description text,
  status text default 'ACTIVE',
  progress integer default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table project_members (
  project_id text not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text default 'MEMBER',
  joined_at timestamptz default now(),
  primary key (project_id, user_id)
);

create table tasks (
  id text primary key,
  project_id text references projects(id) on delete cascade,
  title text not null,
  description text,
  status task_status default 'TODO',
  priority priority default 'MEDIUM',
  assignee_id uuid references users(id) on delete set null,
  due_date timestamptz,
  tags text[],
  created_at timestamptz default now()
);

create table subtasks (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  assignee_id uuid references users(id) on delete set null
);

create table comments (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

create table notifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  read boolean default false,
  created_at timestamptz default now(),
  task_id text references tasks(id) on delete set null
);

create table time_entries (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_seconds integer default 0,
  note text,
  created_at timestamptz default now()
);

create table channels (
  id text primary key,
  name text not null,
  type channel_type default 'TEXT',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table messages (
  id text primary key default gen_random_uuid()::text,
  channel_id text not null references channels(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  text text not null default '',
  attachment_url text,
  attachment_name text,
  attachment_type text,
  is_ai boolean default false,
  created_at timestamptz default now()
);

-- 3. HELPERS (SECURITY DEFINER + locked search_path)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.is_project_member(p_project_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.project_members
      where project_id = p_project_id and user_id = auth.uid()
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, avatar, role, job_role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'avatar',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(new.email, new.id::text)
    ),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'MEMBER'),
    new.raw_user_meta_data->>'job_role',
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.users.name);
  return new;
end;
$$;

-- Trigger auth.users: tạo SAU khi seed Auth (tránh cần DISABLE TRIGGER / ownership).
-- Xem cuối file section 5b.

-- Notification triggers (server-side emit)
create or replace function public.notify_task_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assignee_id is not null
     and (tg_op = 'INSERT' or old.assignee_id is distinct from new.assignee_id)
     and new.assignee_id is distinct from auth.uid() then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      new.assignee_id,
      'Task assigned',
      'You were assigned to: ' || new.title,
      'ASSIGNMENT',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_task_assignment
  after insert or update of assignee_id on public.tasks
  for each row execute function public.notify_task_assignment();

create or replace function public.notify_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and new.assignee_id is not null
     and new.assignee_id is distinct from auth.uid() then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      new.assignee_id,
      'Status change',
      new.title || ' → ' || new.status::text,
      'STATUS_CHANGE',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_task_status_change
  after update of status on public.tasks
  for each row execute function public.notify_task_status_change();

create or replace function public.notify_new_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignee uuid;
  v_title text;
begin
  select assignee_id, title into v_assignee, v_title
  from public.tasks where id = new.task_id;

  if v_assignee is not null and v_assignee is distinct from new.user_id then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      v_assignee,
      'New comment',
      'Comment on: ' || coalesce(v_title, new.task_id),
      'COMMENT',
      new.task_id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_new_comment
  after insert on public.comments
  for each row execute function public.notify_new_comment();

-- 3b. GRANTS — bắt buộc để role authenticated/anon dùng được schema public
-- (thiếu bước này → lỗi 42501 "permission denied for schema public")
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- 4. RLS
alter table users enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table comments enable row level security;
alter table notifications enable row level security;
alter table time_entries enable row level security;
alter table channels enable row level security;
alter table messages enable row level security;

-- users
create policy users_select on users for select to authenticated using (true);
create policy users_update_self on users for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    (id = auth.uid() and role = (select u.role from public.users u where u.id = auth.uid()))
    or public.is_admin()
  );
create policy users_insert_admin on users for insert to authenticated
  with check (public.is_admin());
create policy users_delete_admin on users for delete to authenticated
  using (public.is_admin() and id <> auth.uid());

-- projects
create policy projects_select on projects for select to authenticated
  using (public.is_admin() or public.is_project_member(id));
create policy projects_insert on projects for insert to authenticated
  with check (auth.uid() is not null);
create policy projects_update on projects for update to authenticated
  using (public.is_admin() or public.is_project_member(id))
  with check (public.is_admin() or public.is_project_member(id));
create policy projects_delete on projects for delete to authenticated
  using (public.is_admin());

-- project_members
create policy pm_select on project_members for select to authenticated
  using (public.is_admin() or public.is_project_member(project_id) or user_id = auth.uid());
create policy pm_insert on project_members for insert to authenticated
  with check (public.is_admin() or public.is_project_member(project_id) or user_id = auth.uid());
create policy pm_update on project_members for update to authenticated
  using (public.is_admin() or public.is_project_member(project_id));
create policy pm_delete on project_members for delete to authenticated
  using (public.is_admin() or public.is_project_member(project_id));

-- tasks
create policy tasks_select on tasks for select to authenticated
  using (public.is_project_member(project_id));
create policy tasks_insert on tasks for insert to authenticated
  with check (public.is_project_member(project_id));
create policy tasks_update on tasks for update to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy tasks_delete on tasks for delete to authenticated
  using (public.is_project_member(project_id));

-- subtasks
create policy subtasks_select on subtasks for select to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));
create policy subtasks_write on subtasks for all to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ))
  with check (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));

-- comments
create policy comments_select on comments for select to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));
create policy comments_insert on comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id))
  );
create policy comments_update on comments for update to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy comments_delete on comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- notifications
create policy notif_select on notifications for select to authenticated
  using (user_id = auth.uid());
create policy notif_update on notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy notif_insert on notifications for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
create policy notif_delete on notifications for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- time_entries
create policy te_select on time_entries for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy te_insert on time_entries for insert to authenticated
  with check (user_id = auth.uid());
create policy te_update on time_entries for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy te_delete on time_entries for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- channels / messages
create policy channels_select on channels for select to authenticated using (true);
create policy channels_insert on channels for insert to authenticated
  with check (public.is_admin());
create policy channels_update on channels for update to authenticated
  using (public.is_admin());
create policy channels_delete on channels for delete to authenticated
  using (public.is_admin());

create policy messages_select on messages for select to authenticated using (true);
create policy messages_insert on messages for insert to authenticated
  with check (auth.uid() is not null and (user_id = auth.uid() or is_ai = true));
create policy messages_delete on messages for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Realtime (optional; enable in Dashboard if needed)
-- alter publication supabase_realtime add table notifications;
-- alter publication supabase_realtime add table messages;
-- alter publication supabase_realtime add table channels;

-- 5. SEED AUTH USERS + BUSINESS DATA
-- public.users.id REFERENCES auth.users(id) → phải có auth trước.

alter table tasks disable trigger trg_notify_task_assignment;
alter table tasks disable trigger trg_notify_task_status_change;
alter table comments disable trigger trg_notify_new_comment;

-- Xoá auth demo cũ (nếu từng seed / tạo tay cùng email hoặc cùng UUID)
-- Không dùng ALTER TRIGGER trên auth.users.
delete from auth.identities
where user_id in (
  'a1111111-1111-4111-8111-111111111111',
  'a2222222-2222-4222-8222-222222222222',
  'a3333333-3333-4333-8333-333333333333',
  'a4444444-4444-4444-8444-444444444444',
  'a5555555-5555-4555-8555-555555555555'
)
or provider_id in (
  'admin@sabtask.com',
  'sarah@sabtask.com',
  'mike@sabtask.com',
  'emily@sabtask.com',
  'lan@sabtask.com'
);

delete from auth.users
where id in (
  'a1111111-1111-4111-8111-111111111111',
  'a2222222-2222-4222-8222-222222222222',
  'a3333333-3333-4333-8333-333333333333',
  'a4444444-4444-4444-8444-444444444444',
  'a5555555-5555-4555-8555-555555555555'
)
or email in (
  'admin@sabtask.com',
  'sarah@sabtask.com',
  'mike@sabtask.com',
  'emily@sabtask.com',
  'lan@sabtask.com'
);

-- Tạo auth.users (password: admin123 / user123 — xem TAI_KHOAN.md)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
(
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated', 'admin@sabtask.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Nguyễn Văn Admin","role":"ADMIN","job_role":"Product Owner","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a2222222-2222-4222-8222-222222222222',
  'authenticated', 'authenticated', 'sarah@sabtask.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Sarah Miller","role":"MEMBER","job_role":"UI Designer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a3333333-3333-4333-8333-333333333333',
  'authenticated', 'authenticated', 'mike@sabtask.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Mike Ross","role":"MEMBER","job_role":"Backend Developer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a4444444-4444-4444-8444-444444444444',
  'authenticated', 'authenticated', 'emily@sabtask.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Emily Wong","role":"MEMBER","job_role":"QA Engineer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a5555555-5555-4555-8555-555555555555',
  'authenticated', 'authenticated', 'lan@sabtask.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Trần Thị Lan","role":"MEMBER","job_role":"Frontend Developer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Lan"}'::jsonb,
  now(), now(), '', '', '', ''
);

-- Identity email (bắt buộc để signInWithPassword hoạt động)
insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) values
(
  gen_random_uuid(), 'a1111111-1111-4111-8111-111111111111',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a1111111-1111-4111-8111-111111111111', 'admin@sabtask.com')::jsonb,
  'email', 'a1111111-1111-4111-8111-111111111111', now(), now(), now()
),
(
  gen_random_uuid(), 'a2222222-2222-4222-8222-222222222222',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a2222222-2222-4222-8222-222222222222', 'sarah@sabtask.com')::jsonb,
  'email', 'a2222222-2222-4222-8222-222222222222', now(), now(), now()
),
(
  gen_random_uuid(), 'a3333333-3333-4333-8333-333333333333',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a3333333-3333-4333-8333-333333333333', 'mike@sabtask.com')::jsonb,
  'email', 'a3333333-3333-4333-8333-333333333333', now(), now(), now()
),
(
  gen_random_uuid(), 'a4444444-4444-4444-8444-444444444444',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a4444444-4444-4444-8444-444444444444', 'emily@sabtask.com')::jsonb,
  'email', 'a4444444-4444-4444-8444-444444444444', now(), now(), now()
),
(
  gen_random_uuid(), 'a5555555-5555-4555-8555-555555555555',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a5555555-5555-4555-8555-555555555555', 'lan@sabtask.com')::jsonb,
  'email', 'a5555555-5555-4555-8555-555555555555', now(), now(), now()
);

insert into public.users (id, name, avatar, role, job_role, email) values
('a1111111-1111-4111-8111-111111111111', 'Nguyễn Văn Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'ADMIN', 'Product Owner', 'admin@sabtask.com'),
('a2222222-2222-4222-8222-222222222222', 'Sarah Miller', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'MEMBER', 'UI Designer', 'sarah@sabtask.com'),
('a3333333-3333-4333-8333-333333333333', 'Mike Ross', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'MEMBER', 'Backend Developer', 'mike@sabtask.com'),
('a4444444-4444-4444-8444-444444444444', 'Emily Wong', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', 'MEMBER', 'QA Engineer', 'emily@sabtask.com'),
('a5555555-5555-4555-8555-555555555555', 'Trần Thị Lan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan', 'MEMBER', 'Frontend Developer', 'lan@sabtask.com')
on conflict (id) do update set
  name = excluded.name,
  avatar = excluded.avatar,
  role = excluded.role,
  job_role = excluded.job_role,
  email = excluded.email;

insert into projects (id, name, description, status, progress, created_by) values
('p1', 'Nova FinTech App', 'Ứng dụng ngân hàng thế hệ mới: bảo mật sinh trắc học và tích hợp crypto.', 'ACTIVE', 75, 'a1111111-1111-4111-8111-111111111111'),
('p2', 'AI Content Engine', 'Nền tảng SaaS dùng LLM để sinh nội dung marketing tự động.', 'ACTIVE', 45, 'a1111111-1111-4111-8111-111111111111'),
('p3', 'Website Marketing Q4', 'Làm mới website doanh nghiệp cho mùa lễ hội cuối năm.', 'COMPLETED', 100, 'a2222222-2222-4222-8222-222222222222'),
('p4', 'Mobile Redesign 2026', 'Thiết kế lại trải nghiệm app di động theo design system mới.', 'ACTIVE', 30, 'a1111111-1111-4111-8111-111111111111');

insert into project_members (project_id, user_id) values
('p1', 'a1111111-1111-4111-8111-111111111111'),
('p1', 'a2222222-2222-4222-8222-222222222222'),
('p1', 'a4444444-4444-4444-8444-444444444444'),
('p1', 'a5555555-5555-4555-8555-555555555555'),
('p2', 'a1111111-1111-4111-8111-111111111111'),
('p2', 'a3333333-3333-4333-8333-333333333333'),
('p2', 'a5555555-5555-4555-8555-555555555555'),
('p3', 'a2222222-2222-4222-8222-222222222222'),
('p3', 'a3333333-3333-4333-8333-333333333333'),
('p3', 'a4444444-4444-4444-8444-444444444444'),
('p4', 'a1111111-1111-4111-8111-111111111111'),
('p4', 'a2222222-2222-4222-8222-222222222222'),
('p4', 'a5555555-5555-4555-8555-555555555555');

insert into tasks (id, project_id, title, description, status, priority, assignee_id, due_date, tags, created_at) values
('t1', 'p1', 'Biometric Authentication', 'Implement FaceID and TouchID login using React Native Biometrics.', 'DONE', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() - interval '2 days', ARRAY['Security', 'Mobile'], now() - interval '10 days'),
('t2', 'p1', 'Transaction History API', 'Optimize the SQL query for retrieving last 1000 transactions.', 'REVIEW', 'HIGH', 'a4444444-4444-4444-8444-444444444444', now() + interval '1 day', ARRAY['Backend', 'Performance'], now() - interval '5 days'),
('t3', 'p1', 'Dark Mode UI Polish', 'Fix contrast issues on the settings screen in dark mode.', 'TODO', 'LOW', 'a2222222-2222-4222-8222-222222222222', now() + interval '5 days', ARRAY['Design', 'UI'], now() - interval '1 day'),
('t4', 'p1', 'Crypto Wallet Integration', 'Connect to Coinbase API for real-time balance updates.', 'IN_PROGRESS', 'MEDIUM', 'a5555555-5555-4555-8555-555555555555', now() + interval '7 days', ARRAY['Web3', 'API'], now() - interval '3 days'),
('t5', 'p2', 'Vector Database Setup', 'Initialize Pinecone index and create embedding generation pipeline.', 'DONE', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() - interval '5 days', ARRAY['AI', 'Infrastructure'], now() - interval '14 days'),
('t6', 'p2', 'Prompt Engineering', 'Refine system prompts for blog post generation.', 'IN_PROGRESS', 'HIGH', 'a3333333-3333-4333-8333-333333333333', now() + interval '3 days', ARRAY['AI', 'Product'], now() - interval '4 days'),
('t7', 'p2', 'Stripe Subscription Flow', 'Implement tiered pricing (Free, Pro, Enterprise) checkout.', 'TODO', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() + interval '10 days', ARRAY['Payments', 'SaaS'], now()),
('t8', 'p4', 'Design tokens sync', 'Đồng bộ design tokens giữa Figma và code.', 'IN_PROGRESS', 'MEDIUM', 'a2222222-2222-4222-8222-222222222222', now() + interval '4 days', ARRAY['Design', 'System'], now() - interval '2 days'),
('t9', 'p4', 'Onboarding flow', 'Xây dựng luồng onboarding 3 bước cho user mới.', 'TODO', 'HIGH', 'a5555555-5555-4555-8555-555555555555', now() + interval '8 days', ARRAY['Frontend', 'UX'], now() - interval '1 day');

insert into subtasks (id, task_id, title, completed, assignee_id) values
('st1', 't1', 'Setup native modules', true, 'a1111111-1111-4111-8111-111111111111'),
('st2', 't1', 'Handle fallback to PIN', true, 'a1111111-1111-4111-8111-111111111111'),
('st3', 't1', 'UI Feedback animations', true, 'a2222222-2222-4222-8222-222222222222'),
('st4', 't2', 'Add database indexing', true, 'a4444444-4444-4444-8444-444444444444'),
('st5', 't2', 'Implement Redis caching', false, 'a4444444-4444-4444-8444-444444444444'),
('st6', 't4', 'Generate API Keys', true, 'a5555555-5555-4555-8555-555555555555'),
('st8', 't6', 'Test temperature settings', true, 'a3333333-3333-4333-8333-333333333333'),
('st9', 't6', 'Create few-shot examples', false, 'a3333333-3333-4333-8333-333333333333'),
('st10', 't6', 'Validate output quality', false, 'a1111111-1111-4111-8111-111111111111');

insert into comments (id, task_id, user_id, text, created_at) values
('c1', 't2', 'a1111111-1111-4111-8111-111111111111', 'Good catch on the index, query time dropped to 200ms.', now() - interval '1 hour'),
('c2', 't6', 'a3333333-3333-4333-8333-333333333333', 'The model is still struggling with tone consistency.', now() - interval '4 hours'),
('c3', 't8', 'a2222222-2222-4222-8222-222222222222', 'Tokens màu primary đã cập nhật trên Figma.', now() - interval '2 hours');

insert into time_entries (id, task_id, user_id, start_time, end_time, duration_seconds, note) values
('te1', 't1', 'a1111111-1111-4111-8111-111111111111', now() - interval '3 days', now() - interval '3 days' + interval '2 hours', 7200, 'Initial setup'),
('te2', 't1', 'a1111111-1111-4111-8111-111111111111', now() - interval '2 days', now() - interval '2 days' + interval '4 hours', 14400, 'Implementation'),
('te3', 't6', 'a3333333-3333-4333-8333-333333333333', now() - interval '1 day', now() - interval '1 day' + interval '1 hour', 3600, 'Testing prompts'),
('te4', 't4', 'a5555555-5555-4555-8555-555555555555', now() - interval '5 hours', now() - interval '3 hours', 7200, 'Wallet API wiring'),
('te5', 't8', 'a2222222-2222-4222-8222-222222222222', now() - interval '6 hours', now() - interval '4 hours', 7200, 'Token audit');

insert into notifications (id, user_id, title, message, type, read, created_at, task_id) values
('n1', 'a1111111-1111-4111-8111-111111111111', 'Task assigned', 'Bạn được nhắc về Crypto Wallet Integration', 'ASSIGNMENT', false, now() - interval '30 minutes', 't4'),
('n2', 'a1111111-1111-4111-8111-111111111111', 'Comment', 'Emily đã cập nhật Transaction History API', 'COMMENT', false, now() - interval '1 hour', 't2'),
('n3', 'a2222222-2222-4222-8222-222222222222', 'Status change', 'Design tokens sync đang In Progress', 'STATUS_CHANGE', true, now() - interval '3 hours', 't8');

insert into channels (id, name, type, created_by) values
('c1', 'general', 'TEXT', 'a1111111-1111-4111-8111-111111111111'),
('c2', 'development', 'TEXT', 'a1111111-1111-4111-8111-111111111111'),
('c3', 'design', 'TEXT', 'a1111111-1111-4111-8111-111111111111'),
('v1', 'Standup Room', 'VOICE', 'a1111111-1111-4111-8111-111111111111'),
('v2', 'Deep Work', 'VOICE', 'a1111111-1111-4111-8111-111111111111');

insert into messages (id, channel_id, user_id, text, is_ai, created_at) values
('m1', 'c1', 'a2222222-2222-4222-8222-222222222222', 'Has anyone seen the updated designs?', false, now() - interval '1 hour'),
('m2', 'c1', 'a1111111-1111-4111-8111-111111111111', 'Yes, I uploaded them to Project A.', false, now() - interval '55 minutes'),
('m3', 'c2', 'a3333333-3333-4333-8333-333333333333', 'API is throwing 500s on the staging server.', false, now() - interval '30 minutes'),
('m4', 'c1', null, 'I can help summarize those design updates if you link the project.', true, now() - interval '50 minutes');

alter table tasks enable trigger trg_notify_task_assignment;
alter table tasks enable trigger trg_notify_task_status_change;
alter table comments enable trigger trg_notify_new_comment;

-- 5b. Gắn trigger tạo profile khi có user Auth mới (sau seed).
-- Có thể bị skip nếu role SQL không đủ quyền trên auth.users — seed demo vẫn OK.
do $$ begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception
  when duplicate_object then
    raise notice 'Trigger on_auth_user_created already exists.';
  when insufficient_privilege then
    raise notice 'Skip create trigger on auth.users (not owner). Demo seed vẫn dùng được; user mới có thể cần tạo profile thủ công hoặc chạy seed:auth.';
end $$;
