-- SUPABASE_SCHEMA_AND_RLS.sql (Smart Kidz)
-- IMPORTANT:
-- 1) In Supabase SQL Editor, paste THIS FILE'S CONTENTS and click Run.
-- 2) Do NOT type or run the filename (e.g., SUPABASE_SCHEMA_AND_RLS.sql) as a SQL statement.
-- 3) Run top-to-bottom in one pass when possible.
--

-- Smart Kidz - Supabase Schema + RLS
-- Run in Supabase SQL Editor (recommended order: this whole file top-to-bottom)

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

-- (DEPRECATED) old lessons table removed; replaced by lesson_templates/lesson_editions/lesson_content_items.

-- =========================
-- =========================
-- 2) Lesson Engine (Templates / Editions / Content Items)
-- =========================
-- Replaces legacy public.lessons + public.lesson_catalog + public.lesson_skills.
-- Supports multi-country, multi-curriculum, versioned lesson content with rich learning layers.

-- Reference tables
create table if not exists public.countries (
  code text primary key,   -- e.g. 'AU'
  name text not null
);

create table if not exists public.locales (
  code text primary key,   -- e.g. 'en-AU'
  language text not null,  -- 'en'
  region text not null     -- 'AU'
);

create table if not exists public.curricula (
  id text primary key,     -- e.g. 'ACARA'
  name text not null,
  country_code text not null references public.countries(code) on delete restrict,
  locale_code text not null references public.locales(code) on delete restrict
);

-- Canonical lesson identity (reusable across countries/curricula)
create table if not exists public.lesson_templates (
  template_id text primary key,
  subject_id text not null references public.subjects(id) on delete restrict,
  year_level integer not null check (year_level >= 0 and year_level <= 6),
  topic text not null default 'General',
  title text not null,
  canonical_tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lesson_templates_subject_year
  on public.lesson_templates(subject_id, year_level);

create index if not exists idx_lesson_templates_topic
  on public.lesson_templates(topic);

-- Country/curriculum/locale-specific edition
create table if not exists public.lesson_editions (
  edition_id text primary key,
  template_id text not null references public.lesson_templates(template_id) on delete cascade,

  country_code text not null references public.countries(code) on delete restrict,
  locale_code text not null references public.locales(code) on delete restrict,
  curriculum_id text not null references public.curricula(id) on delete restrict,

  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft','published','archived')),

  title text not null,
  overview text null,
  objective text null,
  estimated_duration_minutes integer null,

  wrapper_json jsonb not null default '{}'::jsonb,
  curriculum_tags text[] not null default '{}'::text[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uniq_edition unique (template_id, country_code, locale_code, curriculum_id, version)
);

create index if not exists idx_lesson_editions_country_curriculum
  on public.lesson_editions(country_code, curriculum_id, status);

create index if not exists idx_lesson_editions_template
  on public.lesson_editions(template_id);

create index if not exists idx_lesson_editions_title_search
  on public.lesson_editions using gin (
    to_tsvector('english', (title || ' ' || coalesce(overview,'') || ' ' || coalesce(objective,'')))
  );

-- One row per activity/content item
create table if not exists public.lesson_content_items (
  content_id text primary key,
  edition_id text not null references public.lesson_editions(edition_id) on delete cascade,

  activity_order integer not null,
  phase text null,
  type text not null,
  title text null,

  content_json jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uniq_activity_order unique (edition_id, activity_order)
);

create index if not exists idx_content_items_edition_order
  on public.lesson_content_items(edition_id, activity_order);

create index if not exists idx_content_items_type_phase
  on public.lesson_content_items(type, phase);

create index if not exists idx_content_items_json_gin
  on public.lesson_content_items using gin (content_json);

-- Concepts + mapping (spiral learning foundation)
create table if not exists public.concepts (
  concept_id text primary key,
  subject_id text not null references public.subjects(id) on delete restrict,
  year_level integer not null check (year_level >= 0 and year_level <= 6),
  name text not null,
  description text null,
  metadata_json jsonb null
);

create index if not exists idx_concepts_subject_year
  on public.concepts(subject_id, year_level);

create table if not exists public.content_item_concepts (
  content_id text not null references public.lesson_content_items(content_id) on delete cascade,
  concept_id text not null references public.concepts(concept_id) on delete cascade,
  primary key (content_id, concept_id)
);

create index if not exists idx_content_item_concepts_concept
  on public.content_item_concepts(concept_id);

-- Pedagogy layer
create table if not exists public.content_item_pedagogy (
  content_id text primary key references public.lesson_content_items(content_id) on delete cascade,
  pedagogy_json jsonb not null
);

create index if not exists idx_content_item_pedagogy_json
  on public.content_item_pedagogy using gin (pedagogy_json);

-- Accessibility layer
create table if not exists public.content_item_accessibility (
  content_id text primary key references public.lesson_content_items(content_id) on delete cascade,
  accessibility_json jsonb not null
);

create index if not exists idx_content_item_accessibility_json
  on public.content_item_accessibility using gin (accessibility_json);

-- Gamification layer
create table if not exists public.content_item_gamification (
  content_id text primary key references public.lesson_content_items(content_id) on delete cascade,
  gamification_json jsonb not null
);

create index if not exists idx_content_item_gamification_json
  on public.content_item_gamification using gin (gamification_json);

-- Rubrics + mapping
create table if not exists public.rubrics (
  rubric_id text primary key,
  subject_id text not null references public.subjects(id) on delete restrict,
  year_level integer not null check (year_level >= 0 and year_level <= 6),
  activity_type text not null,
  criteria_json jsonb not null
);

create index if not exists idx_rubrics_subject_year_type
  on public.rubrics(subject_id, year_level, activity_type);

create table if not exists public.content_item_rubrics (
  content_id text not null references public.lesson_content_items(content_id) on delete cascade,
  rubric_id text not null references public.rubrics(rubric_id) on delete restrict,
  primary key (content_id, rubric_id)
);

create index if not exists idx_content_item_rubrics_rubric
  on public.content_item_rubrics(rubric_id);

-- Diagnostics: misconceptions + mapping
create table if not exists public.misconceptions (
  misconception_id text primary key,
  subject_id text not null references public.subjects(id) on delete restrict,
  tag text not null unique,
  description text not null,
  intervention_json jsonb null
);

create table if not exists public.content_item_misconceptions (
  content_id text not null references public.lesson_content_items(content_id) on delete cascade,
  misconception_id text not null references public.misconceptions(misconception_id) on delete restrict,
  primary key (content_id, misconception_id)
);

create index if not exists idx_content_item_misconceptions_misconception
  on public.content_item_misconceptions(misconception_id);

-- Feedback strategy layer
create table if not exists public.feedback_strategies (
  strategy_id text primary key,
  description text not null,
  trigger_logic jsonb not null,
  response_template jsonb not null
);

create table if not exists public.content_item_feedback (
  content_id text not null references public.lesson_content_items(content_id) on delete cascade,
  strategy_id text not null references public.feedback_strategies(strategy_id) on delete restrict,
  primary key (content_id, strategy_id)
);

create index if not exists idx_content_item_feedback_strategy
  on public.content_item_feedback(strategy_id);

-- Assets + mapping (rich media)
create table if not exists public.assets (
  asset_id text primary key,
  asset_type text not null check (asset_type in ('image','audio','video','animation','sprite_atlas')),
  uri text not null,
  locale_code text null references public.locales(code) on delete restrict,
  alt_text text null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.content_item_assets (
  content_id text not null references public.lesson_content_items(content_id) on delete cascade,
  asset_id text not null references public.assets(asset_id) on delete restrict,
  usage text not null,
  primary key (content_id, asset_id, usage)
);

-- Experimentation: A/B variants
create table if not exists public.content_variants (
  variant_id text primary key,
  content_id text not null references public.lesson_content_items(content_id) on delete cascade,
  variant_json jsonb not null,
  hypothesis text null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_variants_content
  on public.content_variants(content_id);

-- Catalog view (replaces legacy public.lesson_catalog table + sync trigger)
create or replace view public.v_lesson_catalog as
select
  e.edition_id as id,
  t.year_level,
  t.subject_id,
  e.title,
  t.topic,
  e.curriculum_tags,
  e.country_code as country,
  e.curriculum_id as curriculum,
  e.locale_code as locale,
  e.status,
  e.updated_at
from public.lesson_editions e
join public.lesson_templates t on t.template_id = e.template_id;

-- Optional seed examples (uncomment as needed)
-- insert into public.countries (code, name) values ('AU','Australia') on conflict (code) do nothing;
-- insert into public.locales (code, language, region) values ('en-AU','en','AU') on conflict (code) do nothing;
-- insert into public.curricula (id, name, country_code, locale_code) values ('ACARA','Australian Curriculum (ACARA)','AU','en-AU') on conflict (id) do nothing;

-- 3) Users + Children
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'parent' check (role in ('parent','teacher','admin')),
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
  lesson_id text not null references public.lesson_editions(edition_id) on delete cascade,
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
  lesson_id text references public.lesson_editions(edition_id) on delete set null,
  content_id text references public.lesson_content_items(content_id) on delete set null,
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
  select exists (
    select 1
    from public.subscriptions s
    where s.parent_id = auth.uid()
      and s.status in ('trialing', 'active')
      and (s.current_period_end is null or s.current_period_end > now() - interval '1 day')
  );
$$;

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
grant select on public.v_lesson_catalog to anon, authenticated;
-- Sensitive tables: enable RLS
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.skill_mastery enable row level security;
alter table public.attempts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_events enable row level security;

alter table public.lesson_templates enable row level security;
alter table public.lesson_editions enable row level security;
alter table public.lesson_content_items enable row level security;

alter table public.concepts enable row level security;
alter table public.content_item_concepts enable row level security;
alter table public.content_item_pedagogy enable row level security;
alter table public.content_item_accessibility enable row level security;
alter table public.content_item_gamification enable row level security;

alter table public.rubrics enable row level security;
alter table public.content_item_rubrics enable row level security;

alter table public.misconceptions enable row level security;
alter table public.content_item_misconceptions enable row level security;

alter table public.feedback_strategies enable row level security;
alter table public.content_item_feedback enable row level security;

alter table public.assets enable row level security;
alter table public.content_item_assets enable row level security;

alter table public.content_variants enable row level security;

-- Reference tables (typically admin-managed; enable RLS only if you need to lock these down)
-- alter table public.countries enable row level security;
-- alter table public.locales enable row level security;
-- alter table public.curricula enable row level security;



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

-- LESSON ENGINE (templates/editions/content): require an active subscription
drop policy if exists "lesson_templates_select_subscribed" on public.lesson_templates;
create policy "lesson_templates_select_subscribed"
on public.lesson_templates
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "lesson_editions_select_subscribed" on public.lesson_editions;
create policy "lesson_editions_select_subscribed"
on public.lesson_editions
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "lesson_content_items_select_subscribed" on public.lesson_content_items;
create policy "lesson_content_items_select_subscribed"
on public.lesson_content_items
for select
to authenticated
using (public.has_active_subscription());

-- Rich layers
drop policy if exists "content_item_pedagogy_select_subscribed" on public.content_item_pedagogy;
create policy "content_item_pedagogy_select_subscribed"
on public.content_item_pedagogy
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_item_accessibility_select_subscribed" on public.content_item_accessibility;
create policy "content_item_accessibility_select_subscribed"
on public.content_item_accessibility
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_item_gamification_select_subscribed" on public.content_item_gamification;
create policy "content_item_gamification_select_subscribed"
on public.content_item_gamification
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "concepts_select_subscribed" on public.concepts;
create policy "concepts_select_subscribed"
on public.concepts
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_item_concepts_select_subscribed" on public.content_item_concepts;
create policy "content_item_concepts_select_subscribed"
on public.content_item_concepts
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "rubrics_select_subscribed" on public.rubrics;
create policy "rubrics_select_subscribed"
on public.rubrics
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_item_rubrics_select_subscribed" on public.content_item_rubrics;
create policy "content_item_rubrics_select_subscribed"
on public.content_item_rubrics
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "misconceptions_select_subscribed" on public.misconceptions;
create policy "misconceptions_select_subscribed"
on public.misconceptions
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_item_misconceptions_select_subscribed" on public.content_item_misconceptions;
create policy "content_item_misconceptions_select_subscribed"
on public.content_item_misconceptions
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "feedback_strategies_select_subscribed" on public.feedback_strategies;
create policy "feedback_strategies_select_subscribed"
on public.feedback_strategies
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_item_feedback_select_subscribed" on public.content_item_feedback;
create policy "content_item_feedback_select_subscribed"
on public.content_item_feedback
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "assets_select_subscribed" on public.assets;
create policy "assets_select_subscribed"
on public.assets
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_item_assets_select_subscribed" on public.content_item_assets;
create policy "content_item_assets_select_subscribed"
on public.content_item_assets
for select
to authenticated
using (public.has_active_subscription());

drop policy if exists "content_variants_select_subscribed" on public.content_variants;
create policy "content_variants_select_subscribed"
on public.content_variants
for select
to authenticated
using (public.has_active_subscription());

-- Service role full access (optional/admin)
drop policy if exists "lesson_engine_service_all" on public.lesson_templates;
create policy "lesson_engine_service_all"
on public.lesson_templates
for all
to service_role
using (true)
with check (true);

drop policy if exists "lesson_editions_service_all" on public.lesson_editions;
create policy "lesson_editions_service_all"
on public.lesson_editions
for all
to service_role
using (true)
with check (true);

drop policy if exists "lesson_content_items_service_all" on public.lesson_content_items;
create policy "lesson_content_items_service_all"
on public.lesson_content_items
for all
to service_role
using (true)
with check (true);

drop policy if exists "lesson_layers_service_all" on public.content_item_pedagogy;
create policy "lesson_layers_service_all"
on public.content_item_pedagogy
for all
to service_role
using (true)
with check (true);

drop policy if exists "lesson_layers_accessibility_service_all" on public.content_item_accessibility;
create policy "lesson_layers_accessibility_service_all"
on public.content_item_accessibility
for all
to service_role
using (true)
with check (true);

drop policy if exists "lesson_layers_gamification_service_all" on public.content_item_gamification;
create policy "lesson_layers_gamification_service_all"
on public.content_item_gamification
for all
to service_role
using (true)
with check (true);

drop policy if exists "concepts_service_all" on public.concepts;
create policy "concepts_service_all"
on public.concepts
for all
to service_role
using (true)
with check (true);

drop policy if exists "rubrics_service_all" on public.rubrics;
create policy "rubrics_service_all"
on public.rubrics
for all
to service_role
using (true)
with check (true);

drop policy if exists "misconceptions_service_all" on public.misconceptions;
create policy "misconceptions_service_all"
on public.misconceptions
for all
to service_role
using (true)
with check (true);

drop policy if exists "feedback_strategies_service_all" on public.feedback_strategies;
create policy "feedback_strategies_service_all"
on public.feedback_strategies
for all
to service_role
using (true)
with check (true);

drop policy if exists "assets_service_all" on public.assets;
create policy "assets_service_all"
on public.assets
for all
to service_role
using (true)
with check (true);

drop policy if exists "content_variants_service_all" on public.content_variants;
create policy "content_variants_service_all"
on public.content_variants
for all
to service_role
using (true)
with check (true);
-- =========================
-- End
-- =========================

-- =========================
-- 7) Site Builder (CMS pages)
-- =========================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'marketing' check (scope in ('marketing','app')),
  slug text not null,
  title text not null,
  content_json jsonb not null default '{"version":1,"blocks":[]}'::jsonb,
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (scope, slug)
);

create index if not exists cms_pages_scope_slug_idx on public.cms_pages(scope, slug);
create index if not exists cms_pages_published_idx on public.cms_pages(published);

alter table public.cms_pages enable row level security;

grant select on public.cms_pages to anon, authenticated;
grant insert, update, delete on public.cms_pages to authenticated;

drop policy if exists "cms_pages_select_published" on public.cms_pages;
create policy "cms_pages_select_published"
on public.cms_pages
for select
to anon, authenticated
using (published = true);

drop policy if exists "cms_pages_select_admin" on public.cms_pages;
create policy "cms_pages_select_admin"
on public.cms_pages
for select
to authenticated
using (public.is_admin());

drop policy if exists "cms_pages_write_admin" on public.cms_pages;
create policy "cms_pages_write_admin"
on public.cms_pages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "cms_pages_service_all" on public.cms_pages;
create policy "cms_pages_service_all"
on public.cms_pages
for all
to service_role
using (true)
with check (true);



-- ============================================================
-- 8) Admin Console (username-based) + extended CMS
-- ============================================================

-- Admin users (separate from Supabase Auth users)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null default 'admin' check (role in ('admin','root')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  token text primary key,
  admin_user_id uuid not null references public.admin_users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','root')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
-- No RLS policies intentionally: only service role should access.

-- Navigation (global, editable)
create table if not exists public.cms_navigation_items (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'app' check (scope in ('app','marketing')),
  label text not null,
  href text not null,
  icon text null, -- optional lucide icon name, or null
  sort integer not null default 0,
  is_active boolean not null default true,
  min_role text not null default 'admin' check (min_role in ('admin','root')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cms_navigation_items enable row level security;

-- Public can read active items (safe); writes via service role
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='cms_navigation_items' and policyname='cms_nav_public_read'
  ) then
    create policy cms_nav_public_read on public.cms_navigation_items
      for select using (is_active = true);
  end if;
end $$;

-- Theme (global tokens)
create table if not exists public.cms_theme (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'global' unique,
  tokens jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.cms_theme enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='cms_theme' and policyname='cms_theme_public_read'
  ) then
    create policy cms_theme_public_read on public.cms_theme
      for select using (true);
  end if;
end $$;

-- Redirects (for renamed/deleted pages)
create table if not exists public.cms_redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  status integer not null default 301 check (status in (301,302)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cms_redirects enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='cms_redirects' and policyname='cms_redirects_public_read'
  ) then
    create policy cms_redirects_public_read on public.cms_redirects
      for select using (is_active = true);
  end if;
end $$;

-- Assets metadata (optional; actual binaries live in Supabase Storage)
create table if not exists public.cms_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'cms-assets',
  path text not null,
  public_url text not null,
  mime_type text null,
  size_bytes bigint null,
  alt_text text null,
  tags text[] null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bucket, path)
);
alter table public.cms_assets enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='cms_assets' and policyname='cms_assets_public_read'
  ) then
    create policy cms_assets_public_read on public.cms_assets
      for select using (true);
  end if;
end $$;

-- Page versions (draft/publish history)
create table if not exists public.cms_page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  version integer not null,
  content_json jsonb not null,
  created_at timestamptz not null default now(),
  created_by text null, -- admin username
  note text null,
  unique(page_id, version)
);
alter table public.cms_page_versions enable row level security;
-- Public can read versions? No; keep locked (service role only). No policies.

-- Audit log
create table if not exists public.cms_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text null, -- admin username
  action text not null,
  entity text not null,
  entity_id text null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cms_audit_log enable row level security;
-- No policies; service role only.

-- Settings (e.g., last GitHub sync)
create table if not exists public.cms_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.cms_settings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='cms_settings' and policyname='cms_settings_public_read'
  ) then
    create policy cms_settings_public_read on public.cms_settings
      for select using (key in ('theme','nav'));
  end if;
end $$;
