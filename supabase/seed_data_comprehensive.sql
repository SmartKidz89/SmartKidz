
-- COMPREHENSIVE SEED DATA FOR SMART KIDZ
-- This script repopulates the database with a rich set of lessons across subjects and years.

-- 1. CLEANUP (Optional - remove if you want to keep existing data)
-- DELETE FROM public.lesson_skills;
-- DELETE FROM public.lessons;
-- DELETE FROM public.skills;
-- DELETE FROM public.subjects;

-- 2. SUBJECTS
INSERT INTO public.subjects (id, name, sort_order)
VALUES 
  ('MATH', 'Maths', 1),
  ('ENG', 'English', 2),
  ('SCI', 'Science', 3),
  ('ART', 'Art & Design', 4) -- Extra subject example
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. SKILLS (Comprehensive Sample)
INSERT INTO public.skills (id, subject_id, year_level, name, description)
VALUES
  -- MATH Y1
  ('MATH.Y1.NUM', 'MATH', 1, 'Number & Place Value', 'Counting to 100, reading and writing numbers.'),
  ('MATH.Y1.ADD', 'MATH', 1, 'Addition & Subtraction', 'Simple addition and subtraction using objects.'),
  -- MATH Y2
  ('MATH.Y2.MUL', 'MATH', 2, 'Multiplication', 'Recognizing groups and simple times tables (2, 5, 10).'),
  ('MATH.Y2.SHAPE', 'MATH', 2, 'Geometry', 'Identifying common 2D and 3D shapes.'),
  -- MATH Y3
  ('MATH.Y3.TIME', 'MATH', 3, 'Time', 'Telling time to the minute, AM/PM.'),
  ('MATH.Y3.MEAS', 'MATH', 3, 'Measurement', 'Measuring length, mass, and capacity.'),
  -- MATH Y4
  ('MATH.Y4.FRAC', 'MATH', 4, 'Fractions & Decimals', 'Equivalent fractions and introduction to decimals.'),
  -- MATH Y5
  ('MATH.Y5.DAT', 'MATH', 5, 'Data Representation', 'Interpreting different data displays.'),
  -- MATH Y6
  ('MATH.Y6.ALG', 'MATH', 6, 'Algebra', 'Using variables and finding unknown quantities.'),
  
  -- ENGLISH Y1
  ('ENG.Y1.PHON', 'ENG', 1, 'Phonics', 'Matching sounds to letters.'),
  ('ENG.Y1.SENT', 'ENG', 1, 'Sentence Structure', 'Using capital letters and full stops.'),
  -- ENGLISH Y3
  ('ENG.Y3.PERS', 'ENG', 3, 'Persuasive Writing', 'Expressing opinions with reasons.'),
  -- ENGLISH Y6
  ('ENG.Y6.LIT', 'ENG', 6, 'Literary Analysis', 'Analyzing themes and characters in texts.'),

  -- SCIENCE Y2
  ('SCI.Y2.BIO', 'SCI', 2, 'Biological Sciences', 'Life stages of plants and animals.'),
  -- SCIENCE Y4
  ('SCI.Y4.MAT', 'SCI', 4, 'Matter', 'Properties of natural and processed materials.')
ON CONFLICT (id) DO NOTHING;

-- 4. LESSONS (Rich Content)
INSERT INTO public.lessons (id, year_level, subject_id, title, topic, content_json)
VALUES

  -- MATH YEAR 1: COUNTING
  (
    'MATH_Y1_001', 1, 'MATH', 'Jungle Counting', 'Number Sense',
    '{
      "hook": "Imagine you are an explorer in a deep, green jungle. Can you help us count the animals we see?",
      "overview": "In this lesson, we will practice counting from 1 to 20 using fun jungle animals.",
      "explanation": {
        "concepts": [
          "Every number corresponds to exactly one object.",
          "The last number you say tells you how many objects there are in total."
        ],
        "worked_example": "If I see 3 monkeys, I count them: One, Two, Three. So there are 3 monkeys!"
      },
      "activities": [
        {
          "type": "activity",
          "title": "Spot the Parrots",
          "instructions": "Look at the picture. Point to each parrot and say the number out loud.",
          "duration_min": 5,
          "items": ["Count 1 Blue Parrot", "Count 2 Red Parrots", "Count 5 Green Parrots"]
        },
        {
          "type": "game",
          "title": "Number Hop",
          "instructions": "Jump for every number you count up to 10!",
          "duration_min": 10
        }
      ],
      "quiz": {
        "questions": [
          {"q": "How many fingers do you have on one hand?", "options": ["3", "5", "10"]},
          {"q": "What number comes after 6?", "options": ["5", "7", "8"]}
        ]
      }
    }'::jsonb
  ),

  -- MATH YEAR 3: FRACTIONS
  (
    'MATH_Y3_001', 3, 'MATH', 'The Pizza Party', 'Fractions',
    '{
      "hook": "Who loves pizza? Today we are going to slice up some delicious pizzas to learn about fractions.",
      "overview": "Understand halves, quarters, and eighths by sharing food.",
      "explanation": {
        "concepts": [
          "A fraction represents a part of a whole.",
          "The bottom number (denominator) is how many equal parts the whole is divided into.",
          "The top number (numerator) is how many of those parts we have."
        ],
        "worked_example": "If I cut a pizza into 4 equal slices and eat 1, I have eaten 1/4 (one quarter) of the pizza."
      },
      "activities": [
        {
          "type": "drawing",
          "title": "Draw Your Pizza",
          "instructions": "Draw a circle. Draw lines to cut it into 4 equal pieces. Color in 2 pieces.",
          "duration_min": 10,
          "checks_for_understanding": ["Did you cut it into 4?", "Are they equal size?", "Did you color 2?"]
        }
      ],
      "quiz": {
        "questions": [
          {"q": "What is half of 8?", "options": ["2", "4", "6"]},
          {"q": "Which fraction is bigger?", "options": ["1/2", "1/4"]}
        ]
      }
    }'::jsonb
  ),

  -- MATH YEAR 6: ALGEBRA
  (
    'MATH_Y6_001', 6, 'MATH', 'Detective X', 'Algebra',
    '{
      "hook": "Someone has stolen the golden number! We need to use clues to find the missing value, which we call X.",
      "overview": "Introduction to variables and basic linear equations.",
      "explanation": {
        "concepts": [
          "In algebra, we use letters like x or y to represent unknown numbers.",
          "An equation is like a balanced scale. Whatever you do to one side, you must do to the other."
        ],
        "worked_example": "If x + 5 = 10, we can subtract 5 from both sides to find that x = 5."
      },
      "activities": [
        {
          "type": "worksheet",
          "title": "Solve for X",
          "duration_min": 15,
          "items": ["x + 3 = 7", "2x = 12", "x - 4 = 10"]
        }
      ],
      "quiz": {
        "questions": [
          {"q": "If x = 3, what is 2x + 1?", "options": ["5", "7", "6"]},
          {"q": "Solve: y / 2 = 4", "options": ["2", "6", "8"]}
        ]
      }
    }'::jsonb
  ),

  -- ENGLISH YEAR 1: PHONICS
  (
    'ENG_Y1_001', 1, 'ENG', 'Magic E', 'Phonics',
    '{
      "hook": "Meet the Magic E! He makes the vowel say its name.",
      "overview": "Learn how the silent ''e'' at the end of a word changes the vowel sound.",
      "explanation": {
        "concepts": [
          "Silent E jumps over one consonant to make the vowel long.",
          "''cap'' becomes ''cape'', ''slt'' becomes ''site''."
        ]
      },
      "activities": [
        {
          "type": "reading",
          "title": "Word Transform",
          "instructions": "Read the short word, then add Magic E and read the new word.",
          "items": ["tap -> tape", "kit -> kite", "hop -> hope"]
        }
      ],
      "quiz": {
        "questions": [
          {"q": "Which word has a long ''a'' sound?", "options": ["cap", "cape", "car"]},
          {"q": "What does ''pin'' become with Magic E?", "options": ["pine", "pane", "pain"]}
        ]
      }
    }'::jsonb
  ),

  -- SCIENCE YEAR 4: MATTER
  (
    'SCI_Y4_001', 4, 'SCI', 'Solid, Liquid, Gas', 'Chemistry',
    '{
      "hook": "Everything around you is made of matter. But why is a rock hard and water splashy?",
      "overview": "Explore the three main states of matter and how they change.",
      "explanation": {
        "concepts": [
          "Solids keep their shape.",
          "Liquids flow and take the shape of their container.",
          "Gases expand to fill all available space."
        ],
        "worked_example": "Ice is a solid. When it melts, it becomes water (liquid). When it boils, it becomes steam (gas)."
      },
      "activities": [
        {
          "type": "experiment",
          "title": "Melting Race",
          "instructions": "Put an ice cube in the sun and one in the shade. Which melts faster?",
          "duration_min": 20
        }
      ],
      "quiz": {
        "questions": [
          {"q": "Which state of matter is air?", "options": ["Solid", "Liquid", "Gas"]},
          {"q": "What happens when you freeze water?", "options": ["It becomes a solid", "It becomes a gas"]}
        ]
      }
    }'::jsonb
  )

ON CONFLICT (id) DO UPDATE 
SET 
  title = EXCLUDED.title, 
  topic = EXCLUDED.topic, 
  content_json = EXCLUDED.content_json,
  year_level = EXCLUDED.year_level,
  subject_id = EXCLUDED.subject_id;

-- 5. LINK LESSONS TO SKILLS
INSERT INTO public.lesson_skills (lesson_id, skill_id)
VALUES
  ('MATH_Y1_001', 'MATH.Y1.NUM'),
  ('MATH_Y3_001', 'MATH.Y3.FRAC'),
  ('MATH_Y6_001', 'MATH.Y6.ALG'),
  ('ENG_Y1_001',  'ENG.Y1.PHON'),
  ('SCI_Y4_001',  'SCI.Y4.MAT')
ON CONFLICT (lesson_id, skill_id) DO NOTHING;
