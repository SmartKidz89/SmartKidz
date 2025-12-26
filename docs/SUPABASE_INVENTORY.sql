-- Optional: Inventory table for cosmetic items (Avatar Shop)
-- Run in Supabase SQL editor.

create table if not exists public.skz_child_inventory (
  child_id uuid not null,
  item_id text not null,
  acquired_at timestamptz not null default now(),
  primary key (child_id, item_id)
);

alter table public.skz_child_inventory enable row level security;

-- By default, deny. Use service role via /api routes, or add your own RLS policies.
