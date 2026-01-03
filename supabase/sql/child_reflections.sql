-- Child Reflections (Reflection & Confidence Builder)
-- Run this in Supabase SQL editor.

create table if not exists public.child_reflections (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  mood text not null default 'ok',
  easy text null,
  tricky text null,
  proud text null,
  created_at timestamptz not null default now()
);

create index if not exists child_reflections_child_id_created_at_idx
  on public.child_reflections(child_id, created_at desc);

alter table public.child_reflections enable row level security;

-- Parents can read reflections for their children
drop policy if exists child_reflections_select_own on public.child_reflections;
create policy child_reflections_select_own
  on public.child_reflections
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.children c
      where c.id = child_reflections.child_id
        and c.parent_id = auth.uid()
    )
  );

-- Parents can insert reflections for their children (kids use parent session in this app model)
drop policy if exists child_reflections_insert_own on public.child_reflections;
create policy child_reflections_insert_own
  on public.child_reflections
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.children c
      where c.id = child_reflections.child_id
        and c.parent_id = auth.uid()
    )
  );

-- Service role full access
drop policy if exists child_reflections_service_all on public.child_reflections;
create policy child_reflections_service_all
  on public.child_reflections
  for all
  to service_role
  using (true)
  with check (true);
