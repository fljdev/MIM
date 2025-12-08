-- Migration: Add venue voting functionality
-- Date: 2024-12-08
-- Description: Allows participants to vote for their preferred venue

CREATE TABLE IF NOT EXISTS meetup_venue_votes (
    id SERIAL PRIMARY KEY,
    meetup_id INTEGER NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id VARCHAR(255) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meetup_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_votes_meetup ON meetup_venue_votes(meetup_id);
