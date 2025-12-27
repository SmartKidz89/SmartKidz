-- Add country to lessons (default to AU for existing)
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS country text DEFAULT 'AU';

-- Add country to children (to track which curriculum they use)
ALTER TABLE public.children
ADD COLUMN IF NOT EXISTS country text DEFAULT 'AU';

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_lessons_country ON public.lessons(country);