-- 0004_profiles_children.sql
-- Adds billing fields to profiles and creates children table for multiple kids per parent.

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists billing_address_line1 text,
  add column if not exists billing_address_line2 text,
  add column if not exists billing_city text,
  add column if not exists billing_state text,
  add column if not exists billing_postcode text,
  add column if not exists billing_country text default 'Australia';

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  first_name text not null,
  year_level int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists children_parent_id_idx on public.children(parent_id);

alter table public.children enable row level security;

drop policy if exists "children_select_own" on public.children;
drop policy if exists "children_insert_own" on public.children;
drop policy if exists "children_update_own" on public.children;
drop policy if exists "children_delete_own" on public.children;

create policy "children_select_own"
on public.children for select
using (auth.uid() = parent_id);

create policy "children_insert_own"
on public.children for insert
with check (auth.uid() = parent_id);

create policy "children_update_own"
on public.children for update
using (auth.uid() = parent_id)
with check (auth.uid() = parent_id);

create policy "children_delete_own"
on public.children for delete
using (auth.uid() = parent_id);

-- profiles policies: ensure owner can update their fields (safe re-creation)
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
