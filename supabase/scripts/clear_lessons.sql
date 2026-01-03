-- ⚠️ WARNING: This deletes ALL lessons and user progress linked to them.
-- Use this before importing a fresh batch of lessons.

-- 1. Clear progress and attempts first (good practice, though CASCADE handles it)
TRUNCATE TABLE public.lesson_progress CASCADE;
TRUNCATE TABLE public.lesson_attempts CASCADE;

-- 2. Clear the search catalog
TRUNCATE TABLE public.lesson_catalog CASCADE;

-- 3. Clear the main lessons table
TRUNCATE TABLE public.lessons CASCADE;