-- Step 2: CMS Versioning + Scheduling + Lesson Builder tables
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

-- =========================
-- Admin Console (username login)
-- =========================

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
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_admin_user_id_idx on public.admin_sessions(admin_user_id);
create index if not exists admin_sessions_expires_at_idx on public.admin_sessions(expires_at);

-- =========================
-- CMS Versioning + Scheduling
-- Requires cms_pages table from prior steps.
-- =========================

create table if not exists public.cms_page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','published')),
  created_by text null,
  content_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists cms_page_versions_page_id_idx on public.cms_page_versions(page_id);
create index if not exists cms_page_versions_created_at_idx on public.cms_page_versions(created_at);

-- One scheduled publish per page (upserted by page_id)
create table if not exists public.cms_page_schedules (
  page_id uuid primary key references public.cms_pages(id) on delete cascade,
  publish_at timestamptz not null,
  content_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists cms_page_schedules_publish_at_idx on public.cms_page_schedules(publish_at);

-- =========================
-- Lessons (minimal tables used by app + generators)
-- If these already exist in your project, Supabase will skip these.
-- =========================

create table if not exists public.lesson_templates (
  template_id text primary key,
  subject_id text not null,
  year_level int not null,
  topic text not null default 'General',
  title text not null,
  canonical_tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_editions (
  edition_id text primary key,
  template_id text not null references public.lesson_templates(template_id) on delete cascade,
  country_code text not null default 'AU',
  locale_code text not null default 'en-AU',
  curriculum_id text not null default 'AC9',
  version int not null default 1,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  title text not null,
  wrapper_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_editions_template_id_idx on public.lesson_editions(template_id);

-- =========================
-- Lesson Builder: prompt profiles + image specs + job queues
-- =========================

create table if not exists public.lesson_prompt_profiles (
  prompt_profile text primary key,
  subject text null,
  year_level text null,
  system_prompt text null,
  user_prompt_template text null,
  output_schema_notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_image_specs (
  image_pack text not null,
  image_type text not null,
  comfyui_workflow text null,
  width int null,
  height int null,
  steps int null,
  cfg_scale numeric null,
  sampler text null,
  scheduler text null,
  positive_prompt_template text null,
  negative_prompt text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (image_pack, image_type)
);

create table if not exists public.lesson_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id text not null unique,
  subject text null,
  year_level text null,
  lesson_number int null,
  topic text null,
  subtopic text null,
  difficulty_band text null,
  locale_code text null,
  question_count int null,
  generate_images boolean not null default false,
  image_types text null,
  image_pack text null,
  prompt_profile text null references public.lesson_prompt_profiles(prompt_profile) on delete set null,
  comfyui_workflow_override text null,
  comfyui_prompt_override text null,
  comfyui_negative_prompt_override text null,
  asset_plan_json jsonb null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  image_status text not null default 'pending',
  supabase_lesson_id text null,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_generation_jobs_status_idx on public.lesson_generation_jobs(status);

create table if not exists public.lesson_asset_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id text not null,
  edition_id text not null,
  image_pack text null,
  image_type text not null,
  comfyui_workflow text not null,
  prompt text not null,
  negative_prompt text null,
  width int null,
  height int null,
  steps int null,
  cfg_scale numeric null,
  sampler text null,
  scheduler text null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  storage_path text null,
  public_url text null,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_asset_jobs_status_idx on public.lesson_asset_jobs(status);
create index if not exists lesson_asset_jobs_edition_id_idx on public.lesson_asset_jobs(edition_id);

-- =========================
-- Storage bucket
-- =========================
-- Create a public bucket called 'cms-assets' (or set LESSON_ASSETS_BUCKET).
-- If you prefer private buckets, you can keep it private and serve via signed URLs.
