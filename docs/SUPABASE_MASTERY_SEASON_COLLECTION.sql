-- Mastery, season progress, and collection state per child (JSON).
-- These tables are optional; the app works without them (client-side localStorage),
-- but adding them enables cross-device persistence.

create table if not exists skz_child_mastery (
  child_id uuid primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists skz_child_season (
  child_id uuid primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists skz_child_collection (
  child_id uuid primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table skz_child_mastery enable row level security;
alter table skz_child_season enable row level security;
alter table skz_child_collection enable row level security;

-- Recommended: service-role writes only until you add parent-child access policies.
