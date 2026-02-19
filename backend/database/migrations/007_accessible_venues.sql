-- Migration 007: Accessible Venues Table for MiM Accessibility-Focused Journey Planning
-- Creates comprehensive accessible_venues table for Dublin accessible venues data

-- Enable required extensions for proximity searches
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Main accessible_venues table
CREATE TABLE IF NOT EXISTS accessible_venues (
    -- Primary identification
    id SERIAL PRIMARY KEY,
    venue_name VARCHAR(255) NOT NULL,
    
    -- Location data
    address TEXT,
    eircode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Venue classification
    venue_type VARCHAR(100), -- pub, restaurant, cafe, hotel, shop, museum, etc.
    category VARCHAR(100), -- more specific: irish_pub, cocktail_bar, italian_restaurant, etc.
    
    -- Contact & external references
    phone VARCHAR(20),
    website TEXT,
    google_place_id VARCHAR(255),
    
    -- Core accessibility attributes
    wheelchair_entrance BOOLEAN DEFAULT NULL,
    wheelchair_bathroom BOOLEAN DEFAULT NULL,
    accessible_parking_nearby BOOLEAN DEFAULT NULL,
    level_access_internal BOOLEAN DEFAULT NULL, -- no steps inside venue
    elevator_available BOOLEAN DEFAULT NULL, -- for multi-floor venues
    accessible_bar_counter BOOLEAN DEFAULT NULL, -- lower section for wheelchair users
    
    -- Additional accessibility features
    hearing_loop BOOLEAN DEFAULT NULL,
    braille_menu BOOLEAN DEFAULT NULL,
    service_dog_friendly BOOLEAN DEFAULT NULL,
    quiet_space_available BOOLEAN DEFAULT NULL, -- for sensory needs
    wide_doorways BOOLEAN DEFAULT NULL,
    
    -- Table/seating accessibility
    low_height_tables BOOLEAN DEFAULT NULL,
    wheelchair_space_at_tables BOOLEAN DEFAULT NULL,
    booth_seating_transferable BOOLEAN DEFAULT NULL,
    
    -- Detailed notes and context
    accessibility_notes TEXT, -- free-form notes from source or users
    entrance_notes TEXT, -- specific details about getting in
    bathroom_notes TEXT, -- bathroom-specific details
    nearby_accessible_bathrooms TEXT, -- if venue has no accessible bathroom, list nearby options
    
    -- Overall accessibility classification
    accessibility_level VARCHAR(50), -- Fully Accessible, Accessible Entrance, Semi-Accessible, Not Recommended
    
    -- Data source & verification
    data_source VARCHAR(100), -- Rosie Roaming, Irish Times, Google Places, User Submitted, etc.
    source_date DATE,
    last_verified_date DATE,
    verified_by VARCHAR(100), -- user ID, admin, or 'unverified'
    verification_method VARCHAR(100), -- manual_visit, phone_call, user_report, google_data, etc.
    
    -- Operating information
    opening_hours JSONB, -- Store as JSON for flexibility: {"monday": "12:00-23:00", ...}
    currently_operating BOOLEAN DEFAULT TRUE, -- venue still in business
    
    -- User engagement (for future crowdsourcing)
    user_rating DECIMAL(3, 2), -- average accessibility rating from users (0.00 to 5.00)
    total_ratings INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_rating CHECK (user_rating >= 0 AND user_rating <= 5)
);

-- Create unique constraint for google_place_id (only if not NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'accessible_venues_google_place_id_key' 
        AND conrelid = 'accessible_venues'::regclass
    ) THEN
        ALTER TABLE accessible_venues ADD CONSTRAINT accessible_venues_google_place_id_key 
        UNIQUE (google_place_id);
    END IF;
END $$;

-- Indexes for performance
DO $$
BEGIN
    -- Spatial index for proximity searches (requires earthdistance extension)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_venue_location' 
        AND tablename = 'accessible_venues'
    ) THEN
        CREATE INDEX idx_venue_location ON accessible_venues USING GIST(
            ll_to_earth(latitude, longitude)
        );
    END IF;
    
    -- Other indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_venue_type' 
        AND tablename = 'accessible_venues'
    ) THEN
        CREATE INDEX idx_venue_type ON accessible_venues(venue_type);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_accessibility_level' 
        AND tablename = 'accessible_venues'
    ) THEN
        CREATE INDEX idx_accessibility_level ON accessible_venues(accessibility_level);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_google_place_id' 
        AND tablename = 'accessible_venues'
    ) THEN
        CREATE INDEX idx_google_place_id ON accessible_venues(google_place_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_currently_operating' 
        AND tablename = 'accessible_venues'
    ) THEN
        CREATE INDEX idx_currently_operating ON accessible_venues(currently_operating);
    END IF;
END $$;

-- Function to update updated_at timestamp (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_accessible_venues_updated_at' 
        AND tgrelid = 'accessible_venues'::regclass
    ) THEN
        CREATE TRIGGER update_accessible_venues_updated_at
            BEFORE UPDATE ON accessible_venues
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Migration verification
DO $$ 
BEGIN
    RAISE NOTICE 'Accessible venues migration completed successfully';
    RAISE NOTICE 'Created table: accessible_venues with comprehensive accessibility attributes';
    RAISE NOTICE 'Created indexes for performance optimization';
    RAISE NOTICE 'Enabled earthdistance extension for proximity searches';
END $$;