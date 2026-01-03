-- 1. Grant Premium Bypass to Admin User
INSERT INTO public.profiles (id, role, full_name, subscription_bypass)
VALUES 
  ('b0b33dfa-40f1-46ff-8839-0de55956f17e', 'admin', 'Admin Parent', true)
ON CONFLICT (id) DO UPDATE 
SET 
  subscription_bypass = true,
  role = 'admin';

-- 2. Create a Child Profile (so dashboard isn't empty)
INSERT INTO public.children (id, parent_id, display_name, year_level, country, avatar_key, avatar_config)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'b0b33dfa-40f1-46ff-8839-0de55956f17e', 'Leo', 3, 'AU', 'lion', '{"color":"amber","face":"cool","hat":"cap"}')
ON CONFLICT (id) DO NOTHING;

-- 3. Add Mock Progress (so dashboard isn't empty)
-- Note: These lesson IDs assume you have generated content. 
-- If these specific IDs don't exist, they just won't link to a real lesson title, but the stats will still show.
INSERT INTO public.lesson_progress (child_id, lesson_id, status, mastery_score, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'AU_MATH_Y3_BEG_001', 'completed', 0.9, NOW() - INTERVAL '2 days'),
  ('c0000000-0000-0000-0000-000000000001', 'AU_ENG_Y3_BEG_001', 'completed', 0.85, NOW() - INTERVAL '1 day'),
  ('c0000000-0000-0000-0000-000000000001', 'AU_SCI_Y3_BEG_001', 'completed', 1.0, NOW())
ON CONFLICT DO NOTHING;