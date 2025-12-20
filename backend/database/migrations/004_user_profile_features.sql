-- Migration 004: User Profile Dashboard Features
-- Adds favorite venues, chat persistence, and extended user profile fields

-- 1. FAVORITE VENUES TABLE
CREATE TABLE IF NOT EXISTS favorite_venues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id VARCHAR(255) NOT NULL,
  venue_name VARCHAR(255) NOT NULL,
  venue_address TEXT,
  venue_lat DECIMAL(10, 8),
  venue_lng DECIMAL(11, 8),
  venue_type VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, venue_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_venues_user ON favorite_venues(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_venues_venue ON favorite_venues(venue_id);

-- 2. MEETUP MESSAGES TABLE
CREATE TABLE IF NOT EXISTS meetup_messages (
  id SERIAL PRIMARY KEY,
  meetup_id INTEGER NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'chat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meetup_messages_meetup ON meetup_messages(meetup_id, created_at);
CREATE INDEX IF NOT EXISTS idx_meetup_messages_user ON meetup_messages(user_id);

-- 3. EXTEND USERS TABLE
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS default_transit_mode VARCHAR(50) DEFAULT 'driving',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add constraint (will fail silently if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_default_transit_mode'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT check_default_transit_mode 
    CHECK (default_transit_mode IN ('driving', 'transit', 'walking', 'bicycling'));
  END IF;
END $$;
