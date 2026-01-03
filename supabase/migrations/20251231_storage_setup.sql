-- 1. Create the 'assets' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('assets', 'assets', true, false)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Enable RLS on objects (Security best practice)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow the world to SEE images (Public Read)
DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
CREATE POLICY "Public Read Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

-- 4. Policy: Allow logged-in users (Admins/System) to UPLOAD images
-- Note: The server-side generator bypasses this via service_role key, 
-- but this allows client-side admin tools to work if needed.
DROP POLICY IF EXISTS "Auth Insert Assets" ON storage.objects;
CREATE POLICY "Auth Insert Assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'assets' );

DROP POLICY IF EXISTS "Auth Update Assets" ON storage.objects;
CREATE POLICY "Auth Update Assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'assets' );

DROP POLICY IF EXISTS "Auth Delete Assets" ON storage.objects;
CREATE POLICY "Auth Delete Assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'assets' );