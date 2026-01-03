-- Optimization for World Page filtering
-- Speeds up queries filtering by Subject + Country + Year
CREATE INDEX IF NOT EXISTS idx_lessons_filter 
ON public.lessons(subject_id, country, year_level);

-- Optimization for Search
-- Speeds up text search on Title and Topic
CREATE INDEX IF NOT EXISTS idx_lessons_title_topic 
ON public.lessons USING gin(to_tsvector('english', title || ' ' || coalesce(topic, '')));