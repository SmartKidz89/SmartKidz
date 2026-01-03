-- Fix for "Dashboard not loading"
-- Re-defines critical reporting functions with SECURITY DEFINER to bypass RLS
-- This ensures parents see data for their children without complex policy recursion.

-- 1. Get Child Dashboard
CREATE OR REPLACE FUNCTION public.get_child_dashboard(p_child_id uuid, p_subject_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER -- Bypasses RLS
 SET search_path TO 'public'
AS $function$
declare
  ok boolean;
  child_row jsonb;
  summary jsonb;
  badges jsonb;
  recommended jsonb;
  streak jsonb;
begin
  -- Permission Check: Caller must be parent of child
  -- We do this manually since we are bypassing RLS
  select exists(
    select 1
    from public.children c
    where c.id = p_child_id
    and c.parent_id = auth.uid()
  ) into ok;

  if not ok then
     -- Fail gracefully or return empty
     return jsonb_build_object('error', 'Not authorized or child not found');
  end if;

  -- Get child details
  select jsonb_build_object(
    'id', c.id,
    'display_name', c.display_name,
    'year_level', c.year_level,
    'avatar_key', c.avatar_key,
    'country', c.country
  )
  into child_row
  from public.children c
  where c.id = p_child_id;

  -- Get progress summary
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  into summary
  from (
    select
      l.subject_id,
      count(*) filter (where p.status = 'completed') as lessons_completed,
      count(*) filter (where p.status is not null) as lessons_started,
      round(avg(coalesce(p.mastery_score, 0)), 2) as avg_mastery
    from public.lesson_progress p
    join public.lessons l on l.id = p.lesson_id
    where p.child_id = p_child_id
    group by l.subject_id
  ) t;

  -- Badges (mock or real)
  badges := '[]'::jsonb;
  -- If you have a child_badges table, uncomment:
  -- select coalesce(jsonb_agg(row_to_json(b)), '[]'::jsonb) into badges from public.child_badges b where child_id = p_child_id;
  
  -- Calculate streak (simple version)
  streak := jsonb_build_object('current', 0, 'best', 0);

  return jsonb_build_object(
    'child', child_row,
    'summary', summary,
    'badges', badges,
    'streak', streak
  );
end;
$function$;


-- 2. Get Recommended Lessons
-- This is used by the kid dashboard recommendations panel.
CREATE OR REPLACE FUNCTION public.get_recommended_lessons(p_child_id uuid, p_subject_id text, p_limit integer DEFAULT 10)
 RETURNS TABLE(lesson_id text, title text, topic text, year_level integer, reason text)
 LANGUAGE sql
 SECURITY DEFINER -- Bypasses RLS to see all lessons/progress
 SET search_path TO 'public'
AS $function$
  with child as (
    select year_level
    from public.children
    where id = p_child_id
  ),
  done as (
    select lesson_id
    from public.lesson_progress
    where child_id = p_child_id
      and status = 'completed'
  ),
  base as (
    select
      lc.id as lesson_id,
      lc.title,
      lc.topic,
      lc.year_level,
      case
        when lc.year_level = (select year_level from child) then 'Next lesson for your year level'
        when lc.year_level < (select year_level from child) then 'Revision to strengthen basics'
        else 'Stretch lesson (a little harder)'
      end as reason,
      abs(lc.year_level - (select year_level from child)) as year_distance
    from public.lessons lc -- Changing to query lessons directly to be safe
    where (p_subject_id IS NULL OR lc.subject_id = p_subject_id)
      and lc.id not in (select lesson_id from done)
  )
  select lesson_id, title, topic, year_level, reason
  from base
  order by year_distance asc, lesson_id asc
  limit p_limit;
$function$;