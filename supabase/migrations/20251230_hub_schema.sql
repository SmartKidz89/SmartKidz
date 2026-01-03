-- 1. Child Economy (Coins & XP)
CREATE TABLE IF NOT EXISTS public.skz_child_economy (
  child_id UUID PRIMARY KEY REFERENCES public.children(id) ON DELETE CASCADE,
  coins INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.skz_child_economy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own children's economy" 
  ON public.skz_child_economy FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.children WHERE id = skz_child_economy.child_id AND parent_id = auth.uid()));

-- Service role bypass for API updates
CREATE POLICY "Service role manages economy" 
  ON public.skz_child_economy USING (true) WITH CHECK (true);


-- 2. Child Inventory (Items owned)
CREATE TABLE IF NOT EXISTS public.skz_child_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.skz_child_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own children's inventory" 
  ON public.skz_child_inventory FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.children WHERE id = skz_child_inventory.child_id AND parent_id = auth.uid()));


-- 3. Daily Quests (Per child, per day)
CREATE TABLE IF NOT EXISTS public.skz_daily_quests (
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quests JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (child_id, date)
);

ALTER TABLE public.skz_daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children's quests" 
  ON public.skz_daily_quests FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.children WHERE id = skz_daily_quests.child_id AND parent_id = auth.uid()));


-- 4. Assets Table (For the Generator)
CREATE TABLE IF NOT EXISTS public.assets (
  asset_id TEXT PRIMARY KEY, -- e.g. 'game-maths-miner-cover'
  asset_type TEXT NOT NULL,  -- 'image', 'audio', etc.
  uri TEXT,                  -- 'asset://...' or public URL
  alt_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access to assets (needed for the app to load images)
CREATE POLICY "Public read assets" ON public.assets FOR SELECT USING (true);

-- Allow authenticated users (like admins) to insert/update assets
CREATE POLICY "Admins manage assets" ON public.assets USING (true) WITH CHECK (true);