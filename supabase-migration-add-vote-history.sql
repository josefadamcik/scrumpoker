-- Migration: Add vote_history column to sessions table
-- Run this in your Supabase SQL Editor if you already have an existing sessions table

-- Add vote_history column if it doesn't exist
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS vote_history JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN sessions.vote_history IS 'Stores the history of all voting rounds with participant votes';
