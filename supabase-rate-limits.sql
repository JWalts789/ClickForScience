-- ── Rate Limits Table ──────────────────────────────────────────────────
-- Persistent rate limiting for Edge Functions.
-- Keys follow pattern: "scope:playerId:category" (e.g., "score:uuid:totalRPAllTime")

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for TTL cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_attempt ON rate_limits (last_attempt);

-- RLS: service role only (Edge Functions write, nobody else)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access rate_limits"
  ON rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- ── Cleanup Function ──────────────────────────────────────────────────
-- Call periodically (e.g., via pg_cron or manual) to purge stale entries.
-- Entries older than 1 hour are safe to delete.

CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE last_attempt < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
