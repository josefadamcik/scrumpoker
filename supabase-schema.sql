-- Scrum Poker Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  participants JSONB NOT NULL DEFAULT '{}'::jsonb,
  revealed BOOLEAN NOT NULL DEFAULT false,
  creator_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  vote_history JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read sessions (for joining and viewing)
CREATE POLICY "Anyone can read sessions"
  ON sessions
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert sessions (for creating new sessions)
CREATE POLICY "Anyone can insert sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update sessions (for voting, revealing, resetting)
-- In a production app, you might want to restrict this to session participants only
CREATE POLICY "Anyone can update sessions"
  ON sessions
  FOR UPDATE
  USING (true);

-- Policy: Anyone can delete sessions (for cleanup)
CREATE POLICY "Anyone can delete sessions"
  ON sessions
  FOR DELETE
  USING (true);

-- Create index for faster lookups by session ID
CREATE INDEX IF NOT EXISTS sessions_id_idx ON sessions(id);

-- Create index for expires_at to help with cleanup queries
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

-- Function to automatically delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$;

-- Optional: Create a scheduled job to clean up expired sessions
-- Note: This requires pg_cron extension (available in Supabase)
-- You can also manually run: SELECT delete_expired_sessions();
-- Or set up a Supabase Edge Function to run this periodically

-- Enable real-time for the sessions table
-- This is what makes the magic happen!
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Confirm real-time is enabled
SELECT schemaname, tablename,
       obj_description((schemaname||'.'||tablename)::regclass) as description
FROM pg_tables
WHERE tablename = 'sessions';

COMMENT ON TABLE sessions IS 'Scrum Poker sessions with real-time updates enabled';
