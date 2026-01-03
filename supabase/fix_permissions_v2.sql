-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Grant Permissions to Service Role (Admin API)
GRANT ALL ON TABLE public.lesson_editions TO service_role;
GRANT ALL ON TABLE public.lesson_templates TO service_role;
GRANT ALL ON TABLE public.assets TO service_role;

-- 2. Grant Permissions to Public/Auth Users (App Reading)
GRANT SELECT ON TABLE public.lesson_editions TO anon, authenticated;
GRANT SELECT ON TABLE public.lesson_templates TO anon, authenticated;
GRANT SELECT ON TABLE public.assets TO anon, authenticated;

-- 3. Enable RLS
ALTER TABLE public.lesson_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Idempotent-ish)
DO $$ 
BEGIN
    -- Lesson Editions Read
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read lesson_editions') THEN
        CREATE POLICY "Public read lesson_editions" ON public.lesson_editions FOR SELECT USING (true);
    END IF;

    -- Lesson Templates Read
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read lesson_templates') THEN
        CREATE POLICY "Public read lesson_templates" ON public.lesson_templates FOR SELECT USING (true);
    END IF;

    -- Assets Read
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read assets') THEN
        CREATE POLICY "Public read assets" ON public.assets FOR SELECT USING (true);
    END IF;

    -- Assets Write (Service Role)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service write assets') THEN
        CREATE POLICY "Service write assets" ON public.assets USING (true) WITH CHECK (true);
    END IF;
END $$;