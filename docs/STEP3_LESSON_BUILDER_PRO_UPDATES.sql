-- ============================================================
-- Step 3: Production-grade Lesson Builder upgrades
-- ============================================================
-- Additive migration. Safe to run multiple times.

create extension if not exists "pgcrypto";

-- 1) Year Profiles (imported from SmartKidz Lessons.xlsx)
create table if not exists public.year_profiles (
  year_level text primary key,
  reading_level text null,
  autonomy text null,
  steps_max int null,
  language_complexity text null,
  representations text null,
  adaptive_range text null,
  interleaving text null,
  metacognition text null,
  updated_at timestamptz not null default now()
);

-- 2) ComfyUI workflow templates stored in DB (optional)
create table if not exists public.comfyui_workflows (
  workflow_name text primary key,
  workflow_json jsonb not null,
  notes text null,
  updated_at timestamptz not null default now()
);

-- 3) Asset job linking + retries
alter table public.lesson_asset_jobs
  add column if not exists usage text null;

alter table public.lesson_asset_jobs
  add column if not exists target_content_id text null;

alter table public.lesson_asset_jobs
  add column if not exists asset_id text null;

alter table public.lesson_asset_jobs
  add column if not exists attempts int not null default 0;

alter table public.lesson_asset_jobs
  add column if not exists last_error text null;

create index if not exists lesson_asset_jobs_target_content_id_idx
  on public.lesson_asset_jobs(target_content_id);

-- 4) Generation job validation tracking
alter table public.lesson_generation_jobs
  add column if not exists validation_errors jsonb null;

alter table public.lesson_generation_jobs
  add column if not exists attempts int not null default 0;

alter table public.lesson_generation_jobs
  add column if not exists last_error text null;

-- 5) Basic RLS (optional; service role bypasses)
alter table public.year_profiles enable row level security;
alter table public.comfyui_workflows enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='year_profiles' and policyname='year_profiles_admin_all') then
    execute $pol$
      create policy year_profiles_admin_all on public.year_profiles
      for all using (public.is_admin()) with check (public.is_admin());
    $pol$;
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='comfyui_workflows' and policyname='comfyui_workflows_admin_all') then
    execute $pol$
      create policy comfyui_workflows_admin_all on public.comfyui_workflows
      for all using (public.is_admin()) with check (public.is_admin());
    $pol$;
  end if;
end $$;
