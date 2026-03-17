-- ── Analytics Tables for Click, For Science! ─────────────────────────
-- Run this in Supabase SQL Editor to create the analytics schema.

-- 1. Event-level analytics (individual player actions)
CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGSERIAL PRIMARY KEY,
  player_id   TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  event       TEXT NOT NULL,         -- e.g. 'click', 'prestige', 'buy_generator'
  data        JSONB DEFAULT '{}',    -- event-specific payload
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events (event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_player ON analytics_events (player_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_id);

-- 2. Session snapshots (periodic state summaries)
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id              BIGSERIAL PRIMARY KEY,
  player_id       TEXT NOT NULL,
  session_id      TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_sec    REAL NOT NULL DEFAULT 0,

  -- Progression snapshot
  total_rp_log10      REAL,           -- log10 of totalRPAllTime
  prestige_count      INT DEFAULT 0,
  ascension_count     INT DEFAULT 0,
  lab_level           INT DEFAULT 0,
  madness_level       INT DEFAULT 0,
  dominant_archetype  TEXT,

  -- Activity counts (this session)
  click_count         INT DEFAULT 0,
  generators_bought   INT DEFAULT 0,
  upgrades_bought     INT DEFAULT 0,
  prestiges_done      INT DEFAULT 0,
  researches_started  INT DEFAULT 0,

  -- Progression arrays
  purchased_upgrades      TEXT[] DEFAULT '{}',
  completed_research      TEXT[] DEFAULT '{}',
  completed_challenges    TEXT[] DEFAULT '{}',
  unlocked_achievements   TEXT[] DEFAULT '{}',
  archetype_affinities    JSONB DEFAULT '{}',
  generator_counts        JSONB DEFAULT '{}',
  event_choices           JSONB DEFAULT '{}',

  -- Meta
  platform            TEXT,           -- 'desktop' or 'mobile'
  screen_width        INT,
  screen_height       INT,
  user_agent          TEXT,

  UNIQUE(player_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_player ON analytics_sessions (player_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_ended ON analytics_sessions (ended_at DESC);

-- 3. Daily aggregate (for dashboards, computed by cron or on-read)
CREATE TABLE IF NOT EXISTS analytics_daily (
  date_bucket     DATE NOT NULL,
  metric          TEXT NOT NULL,       -- e.g. 'dau', 'clicks', 'prestiges'
  value           REAL NOT NULL DEFAULT 0,
  breakdown       JSONB DEFAULT '{}', -- optional sub-breakdowns
  PRIMARY KEY (date_bucket, metric)
);

-- ── Row-Level Security ────────────────────────────────────────────────
-- Analytics tables: public insert (via Edge Function with service key),
-- no public read access.

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by Edge Function)
CREATE POLICY "Service role full access events"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access sessions"
  ON analytics_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access daily"
  ON analytics_daily FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-cleanup: delete events older than 90 days (run via pg_cron)
-- SELECT cron.schedule('analytics-cleanup', '0 3 * * *',
--   $$DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days'$$
-- );
