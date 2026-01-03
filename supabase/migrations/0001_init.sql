-- Smart Kidz: core schema (MVP)
-- Run this in Supabase SQL Editor or via CLI migration.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'parent',
  created_at timestamptz not null default now()
);

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  year_level int not null check (year_level between 1 and 6),
  avatar_config jsonb not null default '{}'::jsonb,
  accessibility_settings jsonb not null default '{}'::jsonb,
  learning_style_defaults jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists subjects (
  id text primary key,
  name text not null,
  sort_order int not null default 0
);

create table if not exists lessons (
  id text primary key,
  year_level int not null check (year_level between 1 and 6),
  subject_id text not null references subjects(id) on delete cascade,
  title text not null,
  topic text,
  content_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id text primary key,
  subject_id text not null references subjects(id) on delete cascade,
  year_level int not null check (year_level between 1 and 6),
  name text not null,
  description text
);

create table if not exists lesson_skills (
  lesson_id text not null references lessons(id) on delete cascade,
  skill_id text not null references skills(id) on delete cascade,
  primary key (lesson_id, skill_id)
);

create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  lesson_id text not null references lessons(id) on delete cascade,
  status text not null default 'not_started',
  mastery_score numeric not null default 0,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  unique(child_id, lesson_id)
);

create table if not exists skill_mastery (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  skill_id text not null references skills(id) on delete cascade,
  mastery numeric not null default 0,
  confidence numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique(child_id, skill_id)
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  lesson_id text,
  activity_id text,
  skill_id text,
  correct boolean,
  hints_used int not null default 0,
  difficulty int not null default 1,
  response_time_ms int,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text,
  current_period_end timestamptz,
  plan text,
  updated_at timestamptz not null default now()
);

-- Seed subjects
insert into subjects (id, name, sort_order)
values ('MATH','Maths',1), ('ENG','English',2), ('SCI','Science',3)
on conflict (id) do nothing;

-- RLS
alter table profiles enable row level security;
alter table children enable row level security;
alter table lesson_progress enable row level security;
alter table skill_mastery enable row level security;
alter table attempts enable row level security;
alter table subscriptions enable row level security;

-- Public read: subjects + lessons (preview)
alter table subjects enable row level security;
alter table lessons enable row level security;
alter table skills enable row level security;
alter table lesson_skills enable row level security;

-- Policies
create policy "profiles: owner read"
on profiles for select
using (auth.uid() = id);

create policy "profiles: owner upsert"
on profiles for insert
with check (auth.uid() = id);

create policy "profiles: owner update"
on profiles for update
using (auth.uid() = id);

create policy "children: parent read"
on children for select
using (auth.uid() = parent_id);

create policy "children: parent insert"
on children for insert
with check (auth.uid() = parent_id);

create policy "children: parent update"
on children for update
using (auth.uid() = parent_id);

create policy "progress: parent via child"
on lesson_progress for select
using (
  exists (select 1 from children c where c.id = lesson_progress.child_id and c.parent_id = auth.uid())
);

create policy "progress: parent write via child"
on lesson_progress for insert
with check (
  exists (select 1 from children c where c.id = lesson_progress.child_id and c.parent_id = auth.uid())
);

create policy "progress: parent update via child"
on lesson_progress for update
using (
  exists (select 1 from children c where c.id = lesson_progress.child_id and c.parent_id = auth.uid())
);

create policy "mastery: parent via child select"
on skill_mastery for select
using (
  exists (select 1 from children c where c.id = skill_mastery.child_id and c.parent_id = auth.uid())
);

create policy "mastery: parent via child write"
on skill_mastery for insert
with check (
  exists (select 1 from children c where c.id = skill_mastery.child_id and c.parent_id = auth.uid())
);

create policy "mastery: parent via child update"
on skill_mastery for update
using (
  exists (select 1 from children c where c.id = skill_mastery.child_id and c.parent_id = auth.uid())
);

create policy "attempts: parent via child select"
on attempts for select
using (
  exists (select 1 from children c where c.id = attempts.child_id and c.parent_id = auth.uid())
);

create policy "attempts: parent via child insert"
on attempts for insert
with check (
  exists (select 1 from children c where c.id = attempts.child_id and c.parent_id = auth.uid())
);

-- Lessons/skills publicly readable for marketing preview
create policy "subjects read all" on subjects for select using (true);
create policy "lessons read all" on lessons for select using (true);
create policy "skills read all" on skills for select using (true);
create policy "lesson_skills read all" on lesson_skills for select using (true);

-- Subscriptions: parent can read own record
create policy "subscriptions: parent read"
on subscriptions for select
using (auth.uid() = parent_id);

-- Subscriptions: server writes (service role bypasses RLS automatically)
