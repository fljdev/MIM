-- Migration: Add proposed meetup times
-- Date: December 9, 2024
-- Purpose: Allow creators to propose date/time for meetups and allow invitees to suggest alternatives

-- Add proposed time columns to meetups table
ALTER TABLE meetups 
ADD COLUMN proposed_date DATE,
ADD COLUMN proposed_time_start TIME,
ADD COLUMN proposed_time_end TIME,
ADD COLUMN is_time_flexible BOOLEAN DEFAULT false;

-- Create table for alternative time suggestions
CREATE TABLE meetup_time_suggestions (
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

-- Create index for faster lookups
CREATE INDEX idx_meetup_time_suggestions_meetup_id ON meetup_time_suggestions(meetup_id);
CREATE INDEX idx_meetup_time_suggestions_status ON meetup_time_suggestions(status);

-- Add comment for documentation
COMMENT ON TABLE meetup_time_suggestions IS 'Stores alternative time suggestions when invitee cannot make proposed time';
COMMENT ON COLUMN meetups.proposed_date IS 'The date the creator proposes for the meetup';
COMMENT ON COLUMN meetups.proposed_time_start IS 'Start time of proposed meetup window';
COMMENT ON COLUMN meetups.proposed_time_end IS 'End time of proposed meetup window (NULL for specific time)';
COMMENT ON COLUMN meetups.is_time_flexible IS 'Whether the time is flexible or a specific time';
