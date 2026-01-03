-- SmartKidz: Daily Quests + Economy (optional but recommended)
-- Run in Supabase SQL editor.

create table if not exists public.skz_daily_quests (
  child_id uuid not null,
  date date not null,
  quests jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (child_id, date)
);

-- Basic balance per child (coins/xp/level)
create table if not exists public.skz_child_economy (
  child_id uuid primary key,
  coins int not null default 0,
  xp int not null default 0,
  level int not null default 1,
  updated_at timestamptz not null default now()
);

-- RLS: deny by default; allow via service role/admin routes only unless you build authenticated policies.
alter table public.skz_daily_quests enable row level security;
alter table public.skz_child_economy enable row level security;
