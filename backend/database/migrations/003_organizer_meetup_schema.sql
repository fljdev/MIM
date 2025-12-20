-- Add columns to meetups table for organizer-led flow
ALTER TABLE meetups
ADD COLUMN IF NOT EXISTS meetup_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS meetup_vibe VARCHAR(50),
ADD COLUMN IF NOT EXISTS budget_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS fairness_mode VARCHAR(50) DEFAULT 'fastest',
ADD COLUMN IF NOT EXISTS max_travel_time INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS global_privacy BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS confirmed_venue_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS confirmed_venue_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS calculation_status VARCHAR(50) DEFAULT 'waiting';

-- Add calculated results storage
ALTER TABLE meetups
ADD COLUMN IF NOT EXISTS calculated_midpoint_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS calculated_midpoint_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS calculated_venues JSONB;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetups_code ON meetups(meetup_code);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_participants_meetup ON meetup_participants(meetup_id);
