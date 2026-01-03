-- Smart Kidz · Supabase Schema + RLS
-- Run in Supabase SQL Editor (recommended order: this whole file top→bottom)

-- Extensions (Supabase usually has pgcrypto enabled; this is safe)
create extension if not exists "pgcrypto";

-- =========================
-- 1) Core Reference Tables
-- =========================

create table if not exists public.subjects (
  id text primary key, -- e.g. 'MATH', 'ENG', 'SCI'
  name text not null,
  sort_order int not null default 0
);

create table if not exists public.skills (
  id text primary key, -- e.g. 'MATH.Y6.FRAC.RATIO.PERC'
  subject_id text not null references public.subjects(id) on delete restrict,
  year_level int not null check (year_level between 1 and 6),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id text primary key, -- e.g. 'MATH_Y6_L03'
  year_level int not null check (year_level between 1 and 6),
  subject_id text not null references public.subjects(id) on delete restrict,
  title text not null,
  topic text not null,
  curriculum_tags text[] not null default '{}',
  content_json jsonb not null, -- full lesson object (deep dive, activities, etc.)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_year_subject_idx on public.lessons(year_level, subject_id);

create table if not exists public.lesson_skills (
  lesson_id text not null references public.lessons(id) on delete cascade,
  skill_id text not null references public.skills(id) on delete cascade,
  primary key (lesson_id, skill_id)
);

-- =========================
-- 2) Public Catalog (Preview)
-- =========================
-- This table is safe to expose publicly (no content_json).
-- Used by marketing site / curriculum preview without requiring login.

create table if not exists public.lesson_catalog (
  id text primary key,
  year_level int not null check (year_level between 1 and 6),
  subject_id text not null references public.subjects(id) on delete restrict,
  title text not null,
  topic text not null,
  curriculum_tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create or replace function public.sync_lesson_catalog()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lesson_catalog (id, year_level, subject_id, title, topic, curriculum_tags, updated_at)
  values (new.id, new.year_level, new.subject_id, new.title, new.topic, new.curriculum_tags, now())
  on conflict (id) do update
    set year_level = excluded.year_level,
        subject_id = excluded.subject_id,
        title = excluded.title,
        topic = excluded.topic,
        curriculum_tags = excluded.curriculum_tags,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sync_lesson_catalog on public.lessons;
create trigger trg_sync_lesson_catalog
after insert or update on public.lessons
for each row execute function public.sync_lesson_catalog();

-- =========================
-- 3) Users + Children
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'parent' check (role in ('parent','teacher','admin')),
  subscription_bypass boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  year_level int not null check (year_level between 1 and 6),
  avatar_config jsonb not null default '{}'::jsonb,
  accessibility_settings jsonb not null default '{}'::jsonb,
  learning_style_defaults jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists children_parent_idx on public.children(parent_id);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  mastery_score numeric not null default 0 check (mastery_score >= 0 and mastery_score <= 1),
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, lesson_id)
);

create index if not exists lesson_progress_child_idx on public.lesson_progress(child_id);

create table if not exists public.skill_mastery (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  skill_id text not null references public.skills(id) on delete cascade,
  mastery numeric not null default 0 check (mastery >= 0 and mastery <= 1),
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  updated_at timestamptz not null default now(),
  unique (child_id, skill_id)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete set null,
  activity_id text,
  skill_id text references public.skills(id) on delete set null,
  correct boolean,
  hints_used int not null default 0 check (hints_used >= 0),
  difficulty int not null default 3 check (difficulty between 1 and 5),
  response_time_ms int check (response_time_ms >= 0),
  created_at timestamptz not null default now()
);

create index if not exists attempts_child_created_idx on public.attempts(child_id, created_at desc);

-- =========================
-- 4) Subscriptions (Stripe)
-- =========================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive', -- trialing, active, past_due, canceled, inactive
  plan text, -- monthly, annual
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_parent_unique on public.subscriptions(parent_id);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  type text not null,
  processed_at timestamptz not null default now()
);

-- =========================
-- 5) Helpers
-- =========================

create or replace function public.has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      (select p.subscription_bypass from public.profiles p where p.id = auth.uid()),
      false
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.parent_id = auth.uid()
        and s.status in ('trialing', 'active')
        and (s.current_period_end is null or s.current_period_end > now() - interval '1 day')
    );
$$;

-- Friends & family access codes
create table if not exists public.access_codes (
  code text primary key,
  max_uses int not null default 1 check (max_uses >= 1),
  uses int not null default 0 check (uses >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.access_codes enable row level security;

create or replace function public.redeem_access_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.access_codes%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'Not signed in');
  end if;

  select * into v
  from public.access_codes
  where code = p_code;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Invalid code');
  end if;

  if v.expires_at is not null and v.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'Code expired');
  end if;

  if v.uses >= v.max_uses then
    return jsonb_build_object('ok', false, 'error', 'Code already used');
  end if;

  update public.access_codes
  set uses = uses + 1
  where code = p_code;

  update public.profiles
  set subscription_bypass = true
  where id = auth.uid();

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.redeem_access_code(text) to authenticated;

revoke all on public.access_codes from anon, authenticated;

-- Create profile row automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'parent')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================
-- 6) Row Level Security
-- =========================

-- Public catalog + reference tables
-- (No RLS; safe to select publicly)
grant select on public.subjects to anon, authenticated;
grant select on public.skills to anon, authenticated;
grant select on public.lesson_catalog to anon, authenticated;

-- Sensitive tables: enable RLS
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.skill_mastery enable row level security;
alter table public.attempts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_events enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_skills enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- CHILDREN (owned by parent)
drop policy if exists "children_select_own" on public.children;
create policy "children_select_own"
on public.children
for select
to authenticated
using (parent_id = auth.uid());

drop policy if exists "children_insert_own" on public.children;
create policy "children_insert_own"
on public.children
for insert
to authenticated
with check (parent_id = auth.uid());

drop policy if exists "children_update_own" on public.children;
create policy "children_update_own"
on public.children
for update
to authenticated
using (parent_id = auth.uid())
with check (parent_id = auth.uid());

drop policy if exists "children_delete_own" on public.children;
create policy "children_delete_own"
on public.children
for delete
to authenticated
using (parent_id = auth.uid());

-- ENROLLMENTS (via child ownership)
drop policy if exists "enrollments_select_own" on public.enrollments;
create policy "enrollments_select_own"
on public.enrollments
for select
to authenticated
using (
  exists (
    select 1 from public.children c
    where c.id = enrollments.child_id
      and c.parent_id = auth.uid()
  )
);

drop policy if exists "enrollments_write_own" on public.enrollments;
create policy "enrollments_write_own"
on public.enrollments
for all
to authenticated
using (
  exists (
    select 1 from public.children c
    where c.id = enrollments.child_id
      and c.parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.children c
    where c.id = enrollments.child_id
      and c.parent_id = auth.uid()
  )
);

-- LESSON PROGRESS (via child ownership)
drop policy if exists "lesson_progress_select_own" on public.lesson_progress;
create policy "lesson_progress_select_own"
on public.lesson_progress
for select
to authenticated
using (
  exists (
    select 1 from public.children c
    where c.id = lesson_progress.child_id
      and c.parent_id = auth.uid()
  )
);

drop policy if exists "lesson_progress_write_own" on public.lesson_progress;
create policy "lesson_progress_write_own"
on public.lesson_progress
for all
to authenticated
using (
  exists (
    select 1 from public.children c
    where c.id = lesson_progress.child_id
      and c.parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.children c
    where c.id = lesson_progress.child_id
      and c.parent_id = auth.uid()
  )
);

-- SKILL MASTERY (via child ownership)
drop policy if exists "skill_mastery_select_own" on public.skill_mastery;
create policy "skill_mastery_select_own"
on public.skill_mastery
for select
to authenticated
using (
  exists (
    select 1 from public.children c
    where c.id = skill_mastery.child_id
      and c.parent_id = auth.uid()
  )
);

drop policy if exists "skill_mastery_write_own" on public.skill_mastery;
create policy "skill_mastery_write_own"
on public.skill_mastery
for all
to authenticated
using (
  exists (
    select 1 from public.children c
    where c.id = skill_mastery.child_id
      and c.parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.children c
    where c.id = skill_mastery.child_id
      and c.parent_id = auth.uid()
  )
);

-- ATTEMPTS (via child ownership)
drop policy if exists "attempts_select_own" on public.attempts;
create policy "attempts_select_own"
on public.attempts
for select
to authenticated
using (
  exists (
    select 1 from public.children c
    where c.id = attempts.child_id
      and c.parent_id = auth.uid()
  )
);

drop policy if exists "attempts_write_own" on public.attempts;
create policy "attempts_write_own"
on public.attempts
for insert
to authenticated
with check (
  exists (
    select 1 from public.children c
    where c.id = attempts.child_id
      and c.parent_id = auth.uid()
  )
);

-- SUBSCRIPTIONS
-- Parents can READ their subscription state (used for gating).
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (parent_id = auth.uid());

-- Only service role should create/update subscription rows (Stripe webhook).
drop policy if exists "subscriptions_service_write" on public.subscriptions;
create policy "subscriptions_service_write"
on public.subscriptions
for all
to service_role
using (true)
with check (true);

-- WEBHOOK EVENTS (service only)
drop policy if exists "webhook_events_service" on public.webhook_events;
create policy "webhook_events_service"
on public.webhook_events
for all
to service_role
using (true)
with check (true);

-- LESSONS (full content): require an active subscription
drop policy if exists "lessons_select_subscribed" on public.lessons;
create policy "lessons_select_subscribed"
on public.lessons
for select
to authenticated
using (public.has_active_subscription());

-- lesson_skills: allow subscribed users (so you can show skills in lesson view)
drop policy if exists "lesson_skills_select_subscribed" on public.lesson_skills;
create policy "lesson_skills_select_subscribed"
on public.lesson_skills
for select
to authenticated
using (public.has_active_subscription());

-- Admin/service access (optional)
drop policy if exists "lessons_service_all" on public.lessons;
create policy "lessons_service_all"
on public.lessons
for all
to service_role
using (true)
with check (true);

drop policy if exists "lesson_skills_service_all" on public.lesson_skills;
create policy "lesson_skills_service_all"
on public.lesson_skills
for all
to service_role
using (true)
with check (true);

-- =========================
-- End
-- =========================
