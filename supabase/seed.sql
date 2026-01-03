
-- SEED DATA FOR SMART KIDZ
-- Run this in the Supabase SQL Editor to populate your app with initial content.

-- 1. SUBJECTS
INSERT INTO public.subjects (id, name, sort_order)
VALUES 
  ('MATH', 'Maths', 1),
  ('ENG', 'English', 2),
  ('SCI', 'Science', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. SKILLS (Sample for Year 1-6)
INSERT INTO public.skills (id, subject_id, year_level, name, description)
VALUES
  -- Math Y1
  ('MATH.Y1.COUNT', 'MATH', 1, 'Counting to 100', 'Count forwards and backwards to 100'),
  ('MATH.Y1.ADD', 'MATH', 1, 'Simple Addition', 'Adding numbers up to 20'),
  -- Math Y3
  ('MATH.Y3.MUL', 'MATH', 3, 'Multiplication Basics', 'Introduction to times tables 2, 5, 10'),
  ('MATH.Y3.FRAC', 'MATH', 3, 'Simple Fractions', 'Understanding halves and quarters'),
  -- Math Y6
  ('MATH.Y6.ALG', 'MATH', 6, 'Intro to Algebra', 'Solving simple linear equations'),
  -- English Y1
  ('ENG.Y1.READ', 'ENG', 1, 'Early Reading', 'Recognizing common sight words'),
  -- Science Y2
  ('SCI.Y2.LIVING', 'SCI', 2, 'Living Things', 'Distinguishing living and non-living things')
ON CONFLICT (id) DO NOTHING;

-- 3. LESSONS
-- We put some dummy JSON for content. In a real app, this would be your rich lesson builder structure.
INSERT INTO public.lessons (id, year_level, subject_id, title, topic, content_json)
VALUES
  (
    'MATH_Y1_L01', 1, 'MATH', 
    'Counting Jungle', 'Number Sense', 
    '{"slides": [{"type": "intro", "text": "Welcome to the Jungle!"}, {"type": "activity", "question": "How many monkeys?"}]}'::jsonb
  ),
  (
    'MATH_Y3_L01', 3, 'MATH', 
    'Multiplication Magic', 'Multiplication', 
    '{"slides": [{"type": "intro", "text": "2 x 2 is...?"}]}'::jsonb
  ),
  (
    'MATH_Y6_L01', 6, 'MATH', 
    'Algebra Adventure', 'Algebra', 
    '{"slides": [{"type": "intro", "text": "Find X"}]}'::jsonb
  ),
  (
    'ENG_Y1_L01', 1, 'ENG', 
    'The Cat Sat', 'Phonics', 
    '{"slides": [{"type": "story", "text": "The cat sat on the mat."}]}'::jsonb
  ),
  (
    'SCI_Y2_L01', 2, 'SCI', 
    'Is it Alive?', 'Biology', 
    '{"slides": [{"type": "quiz", "question": "Is a rock alive?"}]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, content_json = EXCLUDED.content_json;

-- 4. LINK LESSONS TO SKILLS
INSERT INTO public.lesson_skills (lesson_id, skill_id)
VALUES
  ('MATH_Y1_L01', 'MATH.Y1.COUNT'),
  ('MATH_Y3_L01', 'MATH.Y3.MUL'),
  ('MATH_Y6_L01', 'MATH.Y6.ALG'),
  ('ENG_Y1_L01',  'ENG.Y1.READ'),
  ('SCI_Y2_L01',  'SCI.Y2.LIVING')
ON CONFLICT (lesson_id, skill_id) DO NOTHING;

