-- 1. Reset the lessons table to avoid ID conflicts
TRUNCATE TABLE public.lessons CASCADE;

-- 2. Ensure all subjects exist (MATH, ENG, SCI, HASS, HPE, ART, TECH, LANG)
-- This prevents "foreign key violation" errors during import.
INSERT INTO public.subjects (id, name, sort_order) VALUES
('MATH', 'Mathematics', 1),
('ENG',  'English', 2),
('SCI',  'Science', 3),
('HASS', 'HASS', 4),
('HPE',  'Health & PE', 5),
('ART',  'The Arts', 6),
('TECH', 'Technologies', 7),
('LANG', 'Languages', 8)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name;

-- 3. Relax the curriculum_tags constraint
-- The CSV might send empty strings or nulls for this array column.
-- Dropping NOT NULL allows the import to succeed even if tags are missing.
ALTER TABLE public.lessons ALTER COLUMN curriculum_tags DROP NOT NULL;