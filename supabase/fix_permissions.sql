-- Run this in your Supabase Dashboard > SQL Editor
-- This fixes the "permission denied" error for the Asset Generator

-- 1. Grant permissions to the Service Role (Admin API)
GRANT ALL ON TABLE public.assets TO service_role;

-- 2. Grant read-only access to app users
GRANT SELECT ON TABLE public.assets TO anon;
GRANT SELECT ON TABLE public.assets TO authenticated;

-- 3. Ensure RLS is enabled
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 4. Create policies

-- Allow Service Role to do everything
DROP POLICY IF EXISTS "Service role full access" ON public.assets;
CREATE POLICY "Service role full access" ON public.assets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow everyone to read images
DROP POLICY IF EXISTS "Public read access" ON public.assets;
CREATE POLICY "Public read access" ON public.assets
  FOR SELECT
  USING (true);