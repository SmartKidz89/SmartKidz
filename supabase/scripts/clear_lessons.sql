-- Clears all lessons and cascades the deletion to linked progress/attempts
-- Run this before importing new CSV data.

TRUNCATE TABLE public.lessons CASCADE;