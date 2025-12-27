-- ================================
-- SmartKidz Admin RBAC + RLS Patch
-- ================================
-- Purpose:
--   Allow authenticated users with profiles.role = 'admin' to manage lesson content
--   through the /app/admin/content UI, while keeping all other users read-only.
--
-- Apply after SUPABASE_SCHEMA_AND_RLS_FIXED.sql

-- Helper function: is_admin()
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) = 'admin'
  );
$$;

-- LESSONS: Admin can insert/update/delete
drop policy if exists "lessons_admin_write" on public.lessons;
create policy "lessons_admin_write"
on public.lessons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- LESSON_SKILLS: Admin can manage mappings
drop policy if exists "lesson_skills_admin_write" on public.lesson_skills;
create policy "lesson_skills_admin_write"
on public.lesson_skills
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Optional: If you want admins to see all child records in tooling (generally not recommended),
-- create explicit policies on children/attempts. Keep child data parent-owned by default.
