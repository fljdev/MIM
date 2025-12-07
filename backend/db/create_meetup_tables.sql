-- Create meetups table
CREATE TABLE IF NOT EXISTS meetups (
    id SERIAL PRIMARY KEY,
    meetup_code VARCHAR(10) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_by_name VARCHAR(100),
    meetup_title VARCHAR(100),
    meetup_vibe VARCHAR(50),
    budget_level VARCHAR(20),
    fairness_mode VARCHAR(50) DEFAULT 'fastest',
    max_travel_time INTEGER DEFAULT 45,
    global_privacy BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'pending',
    calculation_status VARCHAR(50) DEFAULT 'pending',
    confirmed_venue_id VARCHAR(255),
    confirmed_venue_name VARCHAR(255),
    confirmed_at TIMESTAMP,
    calculated_midpoint_lat DECIMAL(10, 8),
    calculated_midpoint_lng DECIMAL(11, 8),
    calculated_venues JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meetup_participants table
CREATE TABLE IF NOT EXISTS meetup_participants (
    id SERIAL PRIMARY KEY,
    meetup_id INTEGER REFERENCES meetups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    participant_name VARCHAR(100) NOT NULL,
    location_name TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    transit_mode VARCHAR(50) DEFAULT 'walking',
    budget_level VARCHAR(20),
    fairness_mode VARCHAR(50),
    is_private BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meetup_comments table
CREATE TABLE IF NOT EXISTS meetup_comments (
    id SERIAL PRIMARY KEY,
    meetup_id INTEGER REFERENCES meetups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetups_code ON meetups(meetup_code);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_meetups_created_by ON meetups(created_by);
CREATE INDEX IF NOT EXISTS idx_participants_meetup ON meetup_participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON meetup_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_meetup ON meetup_comments(meetup_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON meetup_comments(user_id);
