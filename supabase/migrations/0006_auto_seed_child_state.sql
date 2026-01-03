-- Auto-seed per-child state on child profile creation
-- 1) Seed skill_mastery rows for the child's year level
-- 2) Create an enrollment row (optional but useful)

create or replace function public.handle_new_child()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Seed mastery for all skills in the child's year level
  insert into public.skill_mastery (child_id, skill_id, mastery, confidence, updated_at)
  select new.id, s.id, 0, 0.5, now()
  from public.skills s
  where s.year_level = new.year_level
  on conflict (child_id, skill_id) do nothing;

  -- Create an enrollment row if one doesn't exist for this child
  insert into public.enrollments (child_id, status, created_at)
  select new.id, 'active', now()
  where not exists (
    select 1 from public.enrollments e where e.child_id = new.id
  );

  return new;
end;
$$;

drop trigger if exists trg_handle_new_child on public.children;
create trigger trg_handle_new_child
after insert on public.children
for each row execute function public.handle_new_child();
