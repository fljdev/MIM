-- Migration 006: Accessibility Tables for Accessible Ireland
-- Adds comprehensive accessibility-focused tables for disability journey planning

-- 1. USER ACCESSIBILITY PROFILES
CREATE TABLE IF NOT EXISTS user_accessibility_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Mobility
  mobility_type VARCHAR(50), -- 'wheelchair', 'walker', 'crutches', 'mobility_scooter', 'none'
  transport_access VARCHAR(50), -- 'own_car', 'public_transport', 'specialized_transport', 'combination'
  
  -- Sensory
  autism BOOLEAN DEFAULT false,
  light_sensitivity BOOLEAN DEFAULT false,
  noise_sensitivity BOOLEAN DEFAULT false,
  crowd_sensitivity BOOLEAN DEFAULT false,
  
  -- Other
  hearing_impaired BOOLEAN DEFAULT false,
  vision_impaired BOOLEAN DEFAULT false,
  service_dog BOOLEAN DEFAULT false,
  cognitive_needs BOOLEAN DEFAULT false,
  
  -- Preferences
  preferred_transport_services JSONB,
  avoid_features JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. PHYSICAL ACCESSIBILITY DETAILS FOR VENUES
CREATE TABLE IF NOT EXISTS venue_physical_accessibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Entrance
  step_free_entrance BOOLEAN,
  entrance_steps_count INT,
  ramp_available BOOLEAN,
  automatic_door BOOLEAN,
  door_width_cm INT,
  door_type VARCHAR(50),
  
  -- Parking & Drop-off
  disabled_parking_bays INT DEFAULT 0,
  parking_distance_to_entrance_m INT,
  parking_covered BOOLEAN,
  drop_off_zone BOOLEAN,
  drop_off_location TEXT,
  drop_off_curb_height_cm INT,
  drop_off_covered BOOLEAN,
  
  -- Interior
  level_access_throughout BOOLEAN,
  lift_available BOOLEAN,
  lift_wheelchair_accessible BOOLEAN,
  corridor_width_cm INT,
  narrow_passages BOOLEAN,
  
  -- Seating
  moveable_chairs BOOLEAN,
  wheelchair_space_available BOOLEAN,
  table_height_cm INT,
  space_between_tables VARCHAR(20),
  
  -- Toilets
  accessible_toilet BOOLEAN,
  toilet_grab_rails BOOLEAN,
  toilet_space_for_wheelchair BOOLEAN,
  changing_places_toilet BOOLEAN,
  
  -- General
  accessibility_notes TEXT,
  photos JSONB,
  
  -- Metadata
  submitted_by UUID REFERENCES users(id),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. SENSORY ACCESSIBILITY DETAILS FOR VENUES
CREATE TABLE IF NOT EXISTS venue_sensory_accessibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Noise
  noise_level VARCHAR(20), -- 'very_quiet', 'quiet', 'moderate', 'loud', 'very_loud'
  background_music BOOLEAN,
  music_volume VARCHAR(20),
  live_music BOOLEAN,
  
  -- Lighting
  lighting_type VARCHAR(50), -- 'natural', 'bright_artificial', 'dim', 'mixed'
  flickering_lights BOOLEAN,
  adjustable_lighting BOOLEAN,
  
  -- Environment
  typical_crowd_level VARCHAR(20),
  busy_times JSONB,
  quiet_times JSONB,
  strong_smells BOOLEAN,
  smell_sources TEXT,
  
  -- Autism-friendly
  quiet_space_available BOOLEAN,
  sensory_overload_escape_route BOOLEAN,
  staff_autism_trained BOOLEAN,
  visual_supports_available BOOLEAN,
  
  sensory_notes TEXT,
  photos JSONB,
  
  submitted_by UUID REFERENCES users(id),
  verified BOOLEAN DEFAULT false,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. SPECIAL EVENTS (autism-friendly screenings, quiet hours)
CREATE TABLE IF NOT EXISTS venue_special_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(50), -- 'autism_friendly_screening', 'quiet_hour', 'relaxed_performance', 'sensory_friendly_time'
  description TEXT,
  
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50),
  day_of_week INT,
  start_time TIME,
  end_time TIME,
  next_occurrence TIMESTAMP,
  
  booking_required BOOLEAN DEFAULT false,
  booking_url VARCHAR(255),
  booking_phone VARCHAR(50),
  advance_booking_days INT,
  
  max_capacity INT,
  cost_euro DECIMAL(10, 2),
  special_notes TEXT,
  
  created_by UUID REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. TRANSPORT SERVICES (IWA, Enable Ireland, etc.)
CREATE TABLE IF NOT EXISTS transport_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(50), -- 'specialized', 'public', 'taxi', 'community'
  organization VARCHAR(255),
  
  coverage_areas JSONB,
  service_radius_km INT,
  
  requires_membership BOOLEAN DEFAULT false,
  membership_cost_euro DECIMAL(10, 2),
  requires_advance_booking BOOLEAN DEFAULT false,
  advance_booking_days INT,
  
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  booking_url VARCHAR(255),
  website VARCHAR(255),
  
  wheelchair_accessible BOOLEAN,
  vehicle_types JSONB,
  cost_structure TEXT,
  accepts_free_travel_pass BOOLEAN,
  
  operating_days JSONB,
  operating_hours TEXT,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. ACCESSIBILITY REVIEWS
CREATE TABLE IF NOT EXISTS accessibility_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  review_text TEXT,
  visit_date DATE,
  would_recommend BOOLEAN,
  accessibility_needs_met BOOLEAN,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. ENSURE VENUES TABLE EXISTS WITH UUID PRIMARY KEY
-- First check if venues table exists and has UUID type
DO $$
BEGIN
  -- Check if venues table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venues') THEN
    -- Check if id column is UUID type, if not we need to handle this carefully
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'venues' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
      RAISE NOTICE 'Venues table exists but id column is not UUID type. This may need manual migration.';
    END IF;
  ELSE
    -- Create venues table if it doesn't exist (simplified version)
    CREATE TABLE venues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      address TEXT,
      lat DECIMAL(10, 8),
      lng DECIMAL(11, 8),
      venue_type VARCHAR(100),
      google_places_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  END IF;
END $$;

-- 8. CREATE INDEXES FOR PERFORMANCE
-- Spatial index for venues location (requires earthdistance or PostGIS extension)
-- Using standard GIST index on geography type if PostGIS is available
DO $$
BEGIN
  -- Check if PostGIS extension is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    CREATE INDEX IF NOT EXISTS idx_venues_location_gist ON venues USING GIST (ST_SetSRID(ST_MakePoint(lng, lat), 4326));
  ELSE
    -- Create regular indexes for lat/lng
    CREATE INDEX IF NOT EXISTS idx_venues_lat ON venues(lat);
    CREATE INDEX IF NOT EXISTS idx_venues_lng ON venues(lng);
    RAISE NOTICE 'PostGIS extension not available, created regular lat/lng indexes instead of spatial index.';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_special_events_venue ON venue_special_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_special_events_next_occurrence ON venue_special_events(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_transport_coverage ON transport_services USING GIN (coverage_areas);
CREATE INDEX IF NOT EXISTS idx_accessibility_reviews_venue ON accessibility_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_reviews_user ON accessibility_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accessibility_profiles_user ON user_accessibility_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_physical_accessibility_venue ON venue_physical_accessibility(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_sensory_accessibility_venue ON venue_sensory_accessibility(venue_id);

-- 9. CREATE FUNCTION TO UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. CREATE TRIGGERS FOR UPDATED_AT COLUMNS
DO $$
BEGIN
  -- Create triggers for each table with updated_at column
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_accessibility_profiles') THEN
    DROP TRIGGER IF EXISTS update_user_accessibility_profiles_updated_at ON user_accessibility_profiles;
    CREATE TRIGGER update_user_accessibility_profiles_updated_at
      BEFORE UPDATE ON user_accessibility_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_special_events') THEN
    DROP TRIGGER IF EXISTS update_venue_special_events_updated_at ON venue_special_events;
    CREATE TRIGGER update_venue_special_events_updated_at
      BEFORE UPDATE ON venue_special_events
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport_services') THEN
    DROP TRIGGER IF EXISTS update_transport_services_updated_at ON transport_services;
    CREATE TRIGGER update_transport_services_updated_at
      BEFORE UPDATE ON transport_services
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 11. MIGRATION VERIFICATION
DO $$ 
BEGIN
  RAISE NOTICE 'Accessibility tables migration completed successfully';
  RAISE NOTICE 'Created tables: user_accessibility_profiles, venue_physical_accessibility, venue_sensory_accessibility';
  RAISE NOTICE 'Created tables: venue_special_events, transport_services, accessibility_reviews';
  RAISE NOTICE 'Created indexes for performance optimization';
END $$;