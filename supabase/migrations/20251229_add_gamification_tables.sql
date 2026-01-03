-- Adds minimal gamification tables expected by the app API routes.
-- Safe: contains no user data. Apply in Supabase SQL editor or via migrations.

create table if not exists public.skz_child_economy (
  child_id uuid primary key references public.children(id) on delete cascade,
  coins integer not null default 0,
  xp integer not null default 0,
  season_xp integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.skz_child_inventory (
  child_id uuid references public.children(id) on delete cascade,
  item_id text not null,
  qty integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (child_id, item_id)
);

create table if not exists public.skz_child_mastery (
  child_id uuid references public.children(id) on delete cascade,
  skill_id text not null,
  mastery numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (child_id, skill_id)
);

create table if not exists public.skz_daily_quests (
  child_id uuid references public.children(id) on delete cascade,
  quest_date date not null default (now() at time zone 'utc')::date,
  quests jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (child_id, quest_date)
);
