-- Migration 005: Carbon Tracking Feature
-- Adds carbon emission tracking to meetup participants

-- 1. EXTEND MEETUP_PARTICIPANTS TABLE
-- Add columns to track distance traveled and carbon emissions
ALTER TABLE meetup_participants
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS carbon_emitted DECIMAL(10, 4) DEFAULT 0;

-- 2. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON COLUMN meetup_participants.distance_km IS 'Distance traveled by participant to meetup location in kilometers';
COMMENT ON COLUMN meetup_participants.carbon_emitted IS 'Carbon emissions for the journey in kg CO2';
COMMENT ON COLUMN meetup_participants.transit_mode IS 'Mode of transport: walking, bicycling, transit, driving';

-- 3. CREATE INDEXES FOR PERFORMANCE
-- Index for querying user carbon history
CREATE INDEX IF NOT EXISTS idx_participants_user_carbon ON meetup_participants(user_id, carbon_emitted) WHERE carbon_emitted > 0;

-- Index for querying meetup carbon data
CREATE INDEX IF NOT EXISTS idx_participants_meetup_carbon ON meetup_participants(meetup_id, carbon_emitted) WHERE carbon_emitted > 0;

-- Index for journey date queries
CREATE INDEX IF NOT EXISTS idx_participants_joined_date ON meetup_participants(joined_at);

-- 4. CREATE VIEW FOR CARBON STATISTICS
CREATE OR REPLACE VIEW carbon_user_stats AS
SELECT 
  user_id,
  COUNT(*) as journey_count,
  SUM(distance_km) as total_distance_km,
  SUM(carbon_emitted) as total_carbon_kg,
  AVG(carbon_emitted) as avg_carbon_per_journey,
  MAX(joined_at) as last_journey_date
FROM meetup_participants
WHERE user_id IS NOT NULL AND carbon_emitted > 0
GROUP BY user_id;

-- 5. CREATE VIEW FOR MEETUP CARBON SUMMARY
CREATE OR REPLACE VIEW carbon_meetup_stats AS
SELECT 
  meetup_id,
  COUNT(*) as participant_count,
  SUM(distance_km) as total_distance_km,
  SUM(carbon_emitted) as total_carbon_kg,
  AVG(carbon_emitted) as avg_carbon_per_participant,
  STRING_AGG(DISTINCT transit_mode, ', ') as modes_used
FROM meetup_participants
WHERE carbon_emitted > 0
GROUP BY meetup_id;

-- 6. ADD CONSTRAINT TO ENSURE VALID CARBON VALUES (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_carbon_positive') THEN
        ALTER TABLE meetup_participants ADD CONSTRAINT check_carbon_positive CHECK (carbon_emitted >= 0);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_distance_positive') THEN
        ALTER TABLE meetup_participants ADD CONSTRAINT check_distance_positive CHECK (distance_km >= 0);
    END IF;
END $$;

-- 7. CREATE FUNCTION TO CALCULATE CARBON EMISSIONS
-- This can be called from application code or database triggers
CREATE OR REPLACE FUNCTION calculate_carbon_emission(
  p_distance_km DECIMAL,
  p_transit_mode VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
  emission_factor DECIMAL;
BEGIN
  -- Emission factors in kg CO2 per km
  CASE LOWER(p_transit_mode)
    WHEN 'driving' THEN emission_factor := 0.12;
    WHEN 'transit' THEN emission_factor := 0.06;
    WHEN 'walking' THEN emission_factor := 0.0;
    WHEN 'bicycling' THEN emission_factor := 0.0;
    ELSE emission_factor := 0.12; -- Default to car emissions
  END CASE;
  
  RETURN ROUND(p_distance_km * emission_factor, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. MIGRATION VERIFICATION
-- Display current schema for verification
DO $$ 
BEGIN
  RAISE NOTICE 'Carbon tracking migration completed successfully';
  RAISE NOTICE 'Added columns: distance_km, carbon_emitted to meetup_participants';
  RAISE NOTICE 'Created views: carbon_user_stats, carbon_meetup_stats';
  RAISE NOTICE 'Created function: calculate_carbon_emission';
END $$;
