-- Migration: Add proposed meetup times
-- Date: December 9, 2024
-- Purpose: Allow creators to propose date/time for meetups and allow invitees to suggest alternatives

-- Add proposed time columns to meetups table (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meetups' AND column_name='proposed_date') THEN
        ALTER TABLE meetups ADD COLUMN proposed_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meetups' AND column_name='proposed_time_start') THEN
        ALTER TABLE meetups ADD COLUMN proposed_time_start TIME;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meetups' AND column_name='proposed_time_end') THEN
        ALTER TABLE meetups ADD COLUMN proposed_time_end TIME;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meetups' AND column_name='is_time_flexible') THEN
        ALTER TABLE meetups ADD COLUMN is_time_flexible BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create table for alternative time suggestions (idempotent)
CREATE TABLE IF NOT EXISTS meetup_time_suggestions (
  id SERIAL PRIMARY KEY,
  meetup_id INTEGER NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  suggested_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggested_date DATE NOT NULL,
  suggested_time_start TIME NOT NULL,
  suggested_time_end TIME,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meetup_time_suggestions_meetup_id') THEN
        CREATE INDEX idx_meetup_time_suggestions_meetup_id ON meetup_time_suggestions(meetup_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meetup_time_suggestions_status') THEN
        CREATE INDEX idx_meetup_time_suggestions_status ON meetup_time_suggestions(status);
    END IF;
END $$;

-- Add comment for documentation (comments can be re-added safely)
COMMENT ON TABLE meetup_time_suggestions IS 'Stores alternative time suggestions when invitee cannot make proposed time';
COMMENT ON COLUMN meetups.proposed_date IS 'The date the creator proposes for the meetup';
COMMENT ON COLUMN meetups.proposed_time_start IS 'Start time of proposed meetup window';
COMMENT ON COLUMN meetups.proposed_time_end IS 'End time of proposed meetup window (NULL for specific time)';
COMMENT ON COLUMN meetups.is_time_flexible IS 'Whether the time is flexible or a specific time';
