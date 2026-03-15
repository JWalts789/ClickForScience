-- ══════════════════════════════════════════════════════════════════
-- Click, For Science! — Leaderboard Schema
-- Run this in the Supabase SQL Editor to create the tables.
-- ══════════════════════════════════════════════════════════════════

-- ── All-Time Leaderboard ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player_id UUID NOT NULL,
  player_name TEXT NOT NULL CHECK (char_length(player_name) <= 24),
  category TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  value_mantissa DOUBLE PRECISION DEFAULT 0,
  value_exponent INTEGER DEFAULT 0,
  archetype TEXT,
  total_playtime_sec DOUBLE PRECISION DEFAULT 0,
  prestige_count INTEGER DEFAULT 0,
  flags TEXT[] DEFAULT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),

  -- Each player has one entry per category
  UNIQUE (player_id, category)
);

-- Index for leaderboard queries (category + value descending)
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_value
  ON leaderboard (category, value DESC);

-- Index for fastest prestige (ascending)
CREATE INDEX IF NOT EXISTS idx_leaderboard_fastest
  ON leaderboard (category, value ASC)
  WHERE category = 'fastestPrestige';

-- ── Weekly Leaderboard ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard_weekly (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player_id UUID NOT NULL,
  player_name TEXT NOT NULL CHECK (char_length(player_name) <= 24),
  category TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  value_mantissa DOUBLE PRECISION DEFAULT 0,
  value_exponent INTEGER DEFAULT 0,
  archetype TEXT,
  total_playtime_sec DOUBLE PRECISION DEFAULT 0,
  prestige_count INTEGER DEFAULT 0,
  flags TEXT[] DEFAULT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (player_id, category)
);

CREATE INDEX IF NOT EXISTS idx_weekly_category_value
  ON leaderboard_weekly (category, value DESC);

-- ── Row Level Security ──────────────────────────────────────────

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_weekly ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read access" ON leaderboard;
DROP POLICY IF EXISTS "Public read access" ON leaderboard_weekly;
DROP POLICY IF EXISTS "Service role write" ON leaderboard;
DROP POLICY IF EXISTS "Service role write" ON leaderboard_weekly;

-- Public read access (anon key can query)
CREATE POLICY "Public read access" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON leaderboard_weekly
  FOR SELECT USING (true);

-- Only service role can insert/update (via Edge Function)
CREATE POLICY "Service role write" ON leaderboard
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role write" ON leaderboard_weekly
  FOR ALL USING (auth.role() = 'service_role');

-- ── Weekly Reset Function ───────────────────────────────────────
-- Schedule this as a Supabase cron job (pg_cron) to run every Monday at 00:00 UTC:
-- SELECT cron.schedule('weekly-leaderboard-reset', '0 0 * * 1', 'TRUNCATE leaderboard_weekly');

-- Or create the function for manual invocation:
CREATE OR REPLACE FUNCTION reset_weekly_leaderboard()
RETURNS void AS $$
BEGIN
  TRUNCATE leaderboard_weekly;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
