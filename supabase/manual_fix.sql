-- 1. Relax the constraint on the catalog table too
ALTER TABLE public.lesson_catalog ALTER COLUMN curriculum_tags DROP NOT NULL;

-- 2. Update the sync trigger to safely handle NULL tags by converting them to empty arrays
CREATE OR REPLACE FUNCTION public.sync_lesson_catalog()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.lesson_catalog (id, year_level, subject_id, title, topic, curriculum_tags, updated_at)
  values (
    new.id, 
    new.year_level, 
    new.subject_id, 
    new.title, 
    new.topic, 
    COALESCE(new.curriculum_tags, '{}'), -- FIX: Converts NULL to empty array
    now()
  )
  on conflict (id) do update
    set year_level = excluded.year_level,
        subject_id = excluded.subject_id,
        title = excluded.title,
        topic = excluded.topic,
        curriculum_tags = COALESCE(excluded.curriculum_tags, '{}'),
        updated_at = now();
  return new;
end;
$function$;