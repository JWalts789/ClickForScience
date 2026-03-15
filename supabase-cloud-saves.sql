-- ══════════════════════════════════════════════════════════════════
-- Click, For Science! — Cloud Saves Schema
-- Run this in the Supabase SQL Editor AFTER the leaderboard schema.
-- ══════════════════════════════════════════════════════════════════

-- ── Cloud Saves Table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_saves (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  save_data TEXT NOT NULL,
  save_version INTEGER DEFAULT 1,
  total_playtime_sec DOUBLE PRECISION DEFAULT 0,
  prestige_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One save per user
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_cloud_saves_user
  ON cloud_saves (user_id);

-- ── Row Level Security ──────────────────────────────────────────

ALTER TABLE cloud_saves ENABLE ROW LEVEL SECURITY;

-- Users can only read their own save
DROP POLICY IF EXISTS "Users read own save" ON cloud_saves;
CREATE POLICY "Users read own save" ON cloud_saves
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own save
DROP POLICY IF EXISTS "Users insert own save" ON cloud_saves;
CREATE POLICY "Users insert own save" ON cloud_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own save
DROP POLICY IF EXISTS "Users update own save" ON cloud_saves;
CREATE POLICY "Users update own save" ON cloud_saves
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own save
DROP POLICY IF EXISTS "Users delete own save" ON cloud_saves;
CREATE POLICY "Users delete own save" ON cloud_saves
  FOR DELETE USING (auth.uid() = user_id);
