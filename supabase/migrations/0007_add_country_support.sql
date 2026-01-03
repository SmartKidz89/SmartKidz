-- Add country column to profiles (Parents)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country text DEFAULT 'AU';

-- Add country column to children
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS country text DEFAULT 'AU';

-- Add country column to lessons (Curriculum)
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS country text DEFAULT 'AU';

-- Index for faster filtering by country
CREATE INDEX IF NOT EXISTS idx_lessons_country ON public.lessons(country);

-- Update existing records to default 'AU' if they are null
UPDATE public.profiles SET country = 'AU' WHERE country IS NULL;
UPDATE public.children SET country = 'AU' WHERE country IS NULL;
UPDATE public.lessons SET country = 'AU' WHERE country IS NULL;